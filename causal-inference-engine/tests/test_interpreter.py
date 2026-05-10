import pytest
from unittest.mock import patch, MagicMock
from analysis.interpreter import build_context, ask_interpreter, get_suggested_questions

def test_build_context_includes_experiment_name():
    results = {}
    meta = {"name": "Test Experiment V1", "hypothesis": "It works"}
    context = build_context(results, meta)
    assert "Experiment: Test Experiment V1" in context
    assert "Hypothesis: It works" in context

def test_build_context_includes_ate_value():
    results = {
        "ate": {
            "ate": 0.06,
            "p_value": 0.049,
            "ci_lower": 0.008,
            "ci_upper": 0.128,
            "significant": True
        }
    }
    context = build_context(results, {})
    assert "+6.00" in context
    assert "0.0490" in context or "0.049" in context

def test_build_context_handles_missing_keys():
    # Should not crash
    results = {"ate": {"ate": 0.1}}
    context = build_context(results, None)
    assert "ATE: +10.00" in context

@patch("analysis.interpreter.Groq")
@patch.dict("os.environ", {"GROQ_API_KEY": "test-key"})
def test_ask_interpreter_returns_string(MockGroq):
    mock_client = MagicMock()
    mock_completion = MagicMock()
    mock_completion.choices = [MagicMock()]
    mock_completion.choices[0].message.content = "```\nThis is a response.```"
    mock_client.chat.completions.create.return_value = mock_completion
    MockGroq.return_value = mock_client
    
    response = ask_interpreter("What is this?", "context", [])
    assert response == "This is a response."

@patch("analysis.interpreter.Groq")
@patch.dict("os.environ", {"GROQ_API_KEY": "test-key"})
def test_ask_interpreter_returns_fallback_on_exception(MockGroq):
    MockGroq.side_effect = Exception("API Error")
    response = ask_interpreter("q", "ctx", [])
    assert response == "Analysis unavailable — try again in a moment"

def test_get_suggested_questions_returns_3_items():
    results = {}
    q = get_suggested_questions(results)
    assert len(q) == 3

def test_get_suggested_questions_includes_srm():
    results = {"srm": {"srm_detected": True}}
    q = get_suggested_questions(results)
    assert "Why might the sample ratio be off?" in q

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

@patch("main.ask_interpreter")
def test_interpret_endpoint(mock_ask):
    mock_ask.return_value = "Mocked answer"
    req = {
        "question": "Hello",
        "results": {"ate": {"ate": 0.1}},
        "experiment_meta": {"name": "Test"},
        "history": []
    }
    response = client.post("/interpret", json=req)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "suggested_questions" in data
    assert data["answer"] == "Mocked answer"

def test_health_endpoint():
    response = client.get("/interpreter/health")
    assert response.status_code == 200
    data = response.json()
    assert "groq" in data
