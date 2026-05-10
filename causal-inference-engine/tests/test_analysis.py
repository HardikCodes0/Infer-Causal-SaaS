import pandas as pd
import numpy as np
from analysis.validator import validate_csv
from analysis.stats_engine import compute_ate, detect_srm

def test_validate_csv():
    """Tests CSV validation logic for missing data and sample size."""
    df = pd.DataFrame({"user_id": [1,2], "group": ["c", "t"], "converted": [1,0]})
    res = validate_csv(df)
    assert not res["valid"] # Should fail because n < 30
    
def test_compute_ate():
    """Tests ATE computation for a strong positive effect."""
    df = pd.DataFrame({
        "user_id": range(100),
        "group": ["control"] * 50 + ["treatment"] * 50,
        "converted": [0] * 40 + [1] * 10 + [0] * 10 + [1] * 40
    })
    res = compute_ate(df)
    assert res["ate"] > 0
    assert res["significant"] is True

def test_detect_srm():
    """Tests SRM detection with a severely imbalanced split."""
    df = pd.DataFrame({
        "user_id": range(100),
        "group": ["control"] * 90 + ["treatment"] * 10
    })
    res = detect_srm(df)
    assert res["srm_detected"] is True
