@echo off
echo Starting Causal Inference Engine...

start "Frontend (React)" cmd /c "cd INFER-SAAS-PRODUCT\frontend && npm start"
start "Backend (FastAPI)" cmd /c "cd causal-inference-engine && venv\Scripts\python -m uvicorn main:app --reload"

echo Both servers are starting up!
echo - Frontend will be at: http://localhost:3000
echo - Backend API is at: http://localhost:8000
