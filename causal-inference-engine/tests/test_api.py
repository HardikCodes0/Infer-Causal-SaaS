from fastapi.testclient import TestClient
from main import app
import pandas as pd
import io

client = TestClient(app)

def test_health():
    """Tests the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_analyze_empty_file():
    """Tests the analyze endpoint with an empty file."""
    response = client.post("/analyze", files={"file": ("empty.csv", b"", "text/csv")})
    assert response.status_code == 400

def test_analyze_missing_columns():
    """Tests the analyze endpoint with missing required columns."""
    csv_content = b"col1,col2\n1,2"
    response = client.post("/analyze", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 400
    assert "errors" in response.json()["detail"]

def test_analyze_valid_csv():
    """Tests the analyze endpoint with a valid synthetic dataset."""
    df = pd.DataFrame({
        "user_id": range(100),
        "group": ["control"] * 50 + ["treatment"] * 50,
        "converted": [0] * 25 + [1] * 25 + [0] * 20 + [1] * 30
    })
    csv_bytes = df.to_csv(index=False).encode('utf-8')
    
    response = client.post("/analyze", files={"file": ("test.csv", csv_bytes, "text/csv")})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "results" in data
    assert "summary" in data
