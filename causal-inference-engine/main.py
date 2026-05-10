from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import uuid

from analysis.validator import validate_csv
from analysis.stats_engine import run_full_analysis
from analysis.summarizer import generate_summary
from analysis.interpreter import build_context, ask_interpreter, get_suggested_questions
from database import init_db, save_experiment, get_history, create_user, get_user_by_email
from auth import get_current_user_id, get_password_hash, verify_password, create_access_token
import os

# GROQ_API_KEY must be set in Railway dashboard → Variables tab
# Without it, /interpret returns 503 and frontend shows 
# disabled interpreter panel gracefully

# Initialize the SQLite database on startup
init_db()

app = FastAPI(title="Causal Inference Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

class UserCreate(BaseModel):
    email: str
    password: str

@app.post("/auth/register")
def register(user: UserCreate):
    hashed = get_password_hash(user.password)
    user_id = create_user(user.email, hashed)
    if not user_id:
        raise HTTPException(status_code=400, detail="Email already registered")
    token = create_access_token({"sub": user_id})
    return {"token": token, "email": user.email}

@app.post("/auth/login")
def login(user: UserCreate):
    db_user = get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": db_user["id"]})
    return {"token": token, "email": db_user["email"]}

@app.get("/history")
def fetch_history(user_id: str = Depends(get_current_user_id)):
    """Returns past experiment history for logged-in user."""
    try:
        return {"success": True, "history": get_history(user_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_experiment(
    file: UploadFile = File(...), 
    name: str = Form(None),
    user_id: str = Depends(get_current_user_id)
):
    """Accepts CSV file upload, runs full causal analysis, and saves to DB."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file provided")
        
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
    val_result = validate_csv(df)
    if not val_result["valid"]:
        raise HTTPException(status_code=400, detail={"errors": val_result["errors"]})
        
    try:
        results = run_full_analysis(df)
        summary = generate_summary(results)
        
        # Reformat results slightly so they perfectly match what the frontend UI expects
        frontend_results = {
            "srm": results["srm"],
            "ate": results["ate"],
            "cuped": results["cuped"],
            "cate": {seg["name"]: seg["ate"] for seg in results["cate"]["segments"]},
            "power": results["power"],
            "sequential": results.get("sequential", {}),
            "bayesian": results.get("bayesian", {}),
            "summary": summary
        }
        
        # Save to database
        exp_id = f"exp_{str(uuid.uuid4())[:6]}"
        exp_name = name if name else file.filename.replace(".csv", "")
        ate = frontend_results["ate"]["ate"]
        significant = frontend_results["ate"]["significant"]
        
        save_experiment(user_id, exp_id, exp_name, ate, significant, frontend_results)
        
        return {
            "success": True,
            "results": frontend_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

class InterpretRequest(BaseModel):
    question: str
    results: dict
    experiment_meta: dict
    history: list = []

@app.post("/interpret")
def interpret_results(req: InterpretRequest):
    context = build_context(req.results, req.experiment_meta)
    answer = ask_interpreter(req.question, context, req.history)
    suggested = get_suggested_questions(req.results)
    
    # If the answer is the fallback string, or API key missing, let's just return what ask_interpreter gives.
    return {
        "answer": answer,
        "suggested_questions": suggested
    }

@app.get("/interpreter/health")
def interpreter_health():
    if os.environ.get("GROQ_API_KEY"):
        return {"groq": "connected"}
    return {"groq": "missing"}
