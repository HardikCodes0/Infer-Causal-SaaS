import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.stats.power as smp
from analysis.sequential import run_sequential_test
from analysis.bayesian import run_bayesian_test

ALPHA = 0.05
POWER = 0.8
CONTROL_LBL = 'control'
TREATMENT_LBL = 'treatment'
GROUP_COL = 'group'
CONVERTED_COL = 'converted'
PRE_METRIC_COL = 'pre_experiment_metric'
SEGMENT_COL = 'segment'

def compute_ate(df: pd.DataFrame) -> dict:
    """Computes Average Treatment Effect using independent t-test."""
    control = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL].dropna()
    treatment = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL].dropna()
    
    # Welch's t-test (unequal variances assumed for robustness against heteroskedasticity)
    t_stat, p_val = stats.ttest_ind(treatment, control, equal_var=False)
    
    ate = float(treatment.mean() - control.mean())
    se = float(np.sqrt(treatment.var()/len(treatment) + control.var()/len(control)))
    ci_lower = float(ate - stats.norm.ppf(1 - ALPHA/2) * se)
    ci_upper = float(ate + stats.norm.ppf(1 - ALPHA/2) * se)
    
    return {
        "ate": ate, "p_value": float(p_val),
        "ci_lower": ci_lower, "ci_upper": ci_upper,
        "significant": bool(p_val < ALPHA)
    }

def detect_srm(df: pd.DataFrame) -> dict:
    """Detects Sample Ratio Mismatch using Chi-Square goodness of fit test."""
    counts = df[GROUP_COL].value_counts()
    n_control = int(counts.get(CONTROL_LBL, 0))
    n_treatment = int(counts.get(TREATMENT_LBL, 0))
    
    # Expected equal allocation 50/50 for a standard experiment
    total = n_control + n_treatment
    expected = [total / 2, total / 2]
    observed = [n_control, n_treatment]
    
    # Chi-square tests if observed frequencies differ significantly from expected 50/50 split
    chi2, p_val = stats.chisquare(f_obs=observed, f_exp=expected)
    
    return {
        "srm_detected": bool(p_val < ALPHA), "p_value": float(p_val),
        "control_n": n_control, "treatment_n": n_treatment
    }

def apply_cuped(df: pd.DataFrame) -> dict:
    """Applies CUPED variance reduction using pre-experiment data."""
    if PRE_METRIC_COL not in df.columns or df[PRE_METRIC_COL].isnull().all():
        return {"cuped_applied": False}
        
    df_clean = df.dropna(subset=[CONVERTED_COL, PRE_METRIC_COL])
    y, x = df_clean[CONVERTED_COL], df_clean[PRE_METRIC_COL]
    
    # Theta is the covariance between pre/post metrics divided by pre variance
    theta = np.cov(x, y)[0, 1] / np.var(x, ddof=1)
    
    # Adjust target metric using pre-experiment covariate to reduce noise
    y_cuped = y - theta * (x - np.mean(x))
    reduction = float(1 - np.var(y_cuped, ddof=1) / np.var(y, ddof=1))
    
    control_mask = df_clean[GROUP_COL] == CONTROL_LBL
    adjusted_ate = float(y_cuped[~control_mask].mean() - y_cuped[control_mask].mean())
    
    return {
        "cuped_applied": True, "variance_reduction_pct": reduction * 100,
        "adjusted_ate": adjusted_ate
    }

def compute_cate(df: pd.DataFrame) -> dict:
    """Computes Conditional Average Treatment Effect per segment."""
    if SEGMENT_COL not in df.columns:
        return {"segments": []}
        
    segments_data = []
    for segment, group_df in df.groupby(SEGMENT_COL):
        try:
            ate_res = compute_ate(group_df)
            segments_data.append({
                "name": str(segment), "ate": ate_res["ate"],
                "p_value": ate_res["p_value"], "n": int(len(group_df))
            })
        except Exception:
            continue
            
    return {"segments": segments_data}

def run_power_analysis(df: pd.DataFrame) -> dict:
    """Runs power analysis to determine if experiment was adequately powered."""
    control = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL].dropna()
    treatment = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL].dropna()
    n_actual = int(len(control) + len(treatment))
    
    pool_sd = np.sqrt((control.var() + treatment.var()) / 2)
    effect_size = (treatment.mean() - control.mean()) / pool_sd if pool_sd > 0 else 0
    
    req_n_per_group = smp.tt_ind_solve_power(effect_size=abs(effect_size), alpha=ALPHA, power=POWER, ratio=1)
    req_total = int(np.ceil(req_n_per_group * 2)) if not np.isnan(req_n_per_group) else 0
    
    return {
        "required_n": req_total, "actual_n": n_actual,
        "adequately_powered": bool(n_actual >= req_total), "cohens_d": float(effect_size)
    }

def run_full_analysis(df: pd.DataFrame) -> dict:
    """Orchestrates all statistical analyses and combines results."""
    ate_results = compute_ate(df)
    cuped_results = apply_cuped(df)
    cate_results = compute_cate(df)
    srm_results = detect_srm(df)
    power_results = run_power_analysis(df)
    
    # Run advanced modules
    try:
        sequential_results = run_sequential_test(df)
    except Exception as e:
        sequential_results = {"error": str(e)}
        
    try:
        bayesian_results = run_bayesian_test(df)
    except Exception as e:
        bayesian_results = {"error": str(e)}
    
    return {
        "ate": ate_results,
        "cuped": cuped_results,
        "cate": cate_results,
        "srm": srm_results,
        "power": power_results,
        "sequential": sequential_results,
        "bayesian": bayesian_results
    }
