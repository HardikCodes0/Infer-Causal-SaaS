export const pyodideScript = `
import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.stats.power as smp
import json
import io

ALPHA = 0.05
POWER = 0.8
CONTROL_LBL = 'control'
TREATMENT_LBL = 'treatment'
GROUP_COL = 'group'
CONVERTED_COL = 'converted'
PRE_METRIC_COL = 'pre_experiment_metric'
SEGMENT_COL = 'segment'

def validate_csv(df: pd.DataFrame):
    if GROUP_COL not in df.columns or CONVERTED_COL not in df.columns:
        if 'variant' in df.columns and 'metric' in df.columns:
            df.rename(columns={'variant': GROUP_COL, 'metric': CONVERTED_COL}, inplace=True)
        else:
            raise ValueError("CSV must contain 'group' and 'converted' columns.")
    
    unique_groups = df[GROUP_COL].dropna().unique()
    if len(unique_groups) != 2:
        raise ValueError("The 'group' column must have exactly 2 unique variants.")
    
    # ensure control/treatment mapping if not explicitly named
    if set(unique_groups) != {CONTROL_LBL, TREATMENT_LBL}:
        if 'A' in unique_groups and 'B' in unique_groups:
            df[GROUP_COL] = df[GROUP_COL].replace({'A': CONTROL_LBL, 'B': TREATMENT_LBL})
        else:
            df[GROUP_COL] = df[GROUP_COL].replace({unique_groups[0]: CONTROL_LBL, unique_groups[1]: TREATMENT_LBL})

def compute_ate(df: pd.DataFrame) -> dict:
    control = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL].dropna()
    treatment = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL].dropna()
    
    if len(control) < 2 or len(treatment) < 2:
        return {"ate": 0.0, "p_value": 1.0, "ci_lower": 0.0, "ci_upper": 0.0, "significant": False}

    t_stat, p_val = stats.ttest_ind(treatment, control, equal_var=False)
    
    ate = float(treatment.mean() - control.mean())
    se = float(np.sqrt(treatment.var()/len(treatment) + control.var()/len(control)))
    ci_lower = float(ate - stats.norm.ppf(1 - ALPHA/2) * se)
    ci_upper = float(ate + stats.norm.ppf(1 - ALPHA/2) * se)
    
    return {
        "ate": ate, "p_value": float(p_val) if not np.isnan(p_val) else 1.0,
        "ci_lower": ci_lower, "ci_upper": ci_upper,
        "significant": bool(p_val < ALPHA) if not np.isnan(p_val) else False
    }

def detect_srm(df: pd.DataFrame) -> dict:
    counts = df[GROUP_COL].value_counts()
    n_control = int(counts.get(CONTROL_LBL, 0))
    n_treatment = int(counts.get(TREATMENT_LBL, 0))
    
    total = n_control + n_treatment
    if total == 0:
        return {"srm_detected": False, "p_value": 1.0, "control_n": 0, "treatment_n": 0}

    expected = [total / 2, total / 2]
    observed = [n_control, n_treatment]
    
    chi2, p_val = stats.chisquare(f_obs=observed, f_exp=expected)
    
    return {
        "srm_detected": bool(p_val < ALPHA) if not np.isnan(p_val) else False, 
        "p_value": float(p_val) if not np.isnan(p_val) else 1.0,
        "control_n": n_control, "treatment_n": n_treatment
    }

def apply_cuped(df: pd.DataFrame) -> dict:
    if PRE_METRIC_COL not in df.columns or df[PRE_METRIC_COL].isnull().all():
        return {"cuped_applied": False}
        
    df_clean = df.dropna(subset=[CONVERTED_COL, PRE_METRIC_COL])
    if len(df_clean) < 2:
         return {"cuped_applied": False}

    y, x = df_clean[CONVERTED_COL], df_clean[PRE_METRIC_COL]
    
    var_x = np.var(x, ddof=1)
    if var_x == 0:
        return {"cuped_applied": False}
        
    theta = np.cov(x, y)[0, 1] / var_x
    
    y_cuped = y - theta * (x - np.mean(x))
    var_y_cuped = np.var(y_cuped, ddof=1)
    var_y = np.var(y, ddof=1)
    
    reduction = float(1 - var_y_cuped / var_y) if var_y != 0 else 0.0
    
    control_mask = df_clean[GROUP_COL] == CONTROL_LBL
    
    if len(y_cuped[~control_mask]) == 0 or len(y_cuped[control_mask]) == 0:
         return {"cuped_applied": False}

    adjusted_ate = float(y_cuped[~control_mask].mean() - y_cuped[control_mask].mean())
    
    return {
        "cuped_applied": True, "variance_reduction_pct": reduction * 100,
        "adjusted_ate": adjusted_ate
    }

def compute_cate(df: pd.DataFrame) -> dict:
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
    control = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL].dropna()
    treatment = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL].dropna()
    n_actual = int(len(control) + len(treatment))
    
    if len(control) < 2 or len(treatment) < 2:
         return {"required_n": 0, "actual_n": n_actual, "adequately_powered": False, "cohens_d": 0.0}

    pool_sd = np.sqrt((control.var() + treatment.var()) / 2)
    effect_size = (treatment.mean() - control.mean()) / pool_sd if pool_sd > 0 else 0
    
    try:
        req_n_per_group = smp.tt_ind_solve_power(effect_size=abs(effect_size), alpha=ALPHA, power=POWER, ratio=1)
        req_total = int(np.ceil(req_n_per_group * 2)) if not np.isnan(req_n_per_group) else 0
    except:
        req_total = 0
        
    return {
        "required_n": req_total, "actual_n": n_actual,
        "adequately_powered": bool(n_actual >= req_total), "cohens_d": float(effect_size)
    }

def run_sequential_test(df: pd.DataFrame) -> dict:
    if 'timestamp' in df.columns:
        df = df.sort_values('timestamp')
    
    trajectory = []
    n_users = len(df)
    
    early_stop_at_n = None
    crosses = 0
    was_significant = False
    
    step_size = 10
    
    for i in range(step_size, n_users + 1, step_size):
        current_data = df.iloc[:i]
        
        control_data = current_data[current_data[GROUP_COL] == CONTROL_LBL][CONVERTED_COL]
        treatment_data = current_data[current_data[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL]
        
        if len(control_data) < 2 or len(treatment_data) < 2:
            continue
            
        stat, pval = stats.ttest_ind(treatment_data, control_data, equal_var=False)
        ate = treatment_data.mean() - control_data.mean()
        
        is_sig = not np.isnan(pval) and pval < 0.05
        
        if is_sig and not was_significant:
            crosses += 1
            if early_stop_at_n is None:
                early_stop_at_n = i
        
        if not is_sig and was_significant:
            crosses += 1
            
        was_significant = is_sig
        
        trajectory.append({
            "users_seen": i,
            "pvalue": float(pval) if not np.isnan(pval) else 1.0,
            "ate": float(ate) if not np.isnan(ate) else 0.0
        })
        
    if n_users % step_size != 0:
        control_data = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL]
        treatment_data = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL]
        if len(control_data) >= 2 and len(treatment_data) >= 2:
            stat, pval = stats.ttest_ind(treatment_data, control_data, equal_var=False)
            ate = treatment_data.mean() - control_data.mean()
            is_sig = not np.isnan(pval) and pval < 0.05
            if is_sig and not was_significant:
                crosses += 1
                if early_stop_at_n is None:
                    early_stop_at_n = n_users
            elif not is_sig and was_significant:
                crosses += 1
                
            trajectory.append({
                "users_seen": n_users,
                "pvalue": float(pval) if not np.isnan(pval) else 1.0,
                "ate": float(ate) if not np.isnan(ate) else 0.0
            })
    
    final_pvalue = trajectory[-1]["pvalue"] if trajectory else 1.0
    
    if crosses > 1:
        peeking_risk = "high"
        interpretation = f"The p-value crossed the significance threshold {crosses} times, indicating high volatility. Stopping early would have been risky as the effect was unstable."
    elif crosses == 1 and early_stop_at_n is not None and early_stop_at_n > n_users * 0.8:
        peeking_risk = "medium"
        interpretation = "Significance was only reached very late in the experiment. Early stopping would not have saved much time."
    elif crosses == 1:
        peeking_risk = "low"
        interpretation = f"The effect became significant early (at {early_stop_at_n} users) and remained stable. You could have safely stopped this experiment early."
    else:
        peeking_risk = "low"
        interpretation = "The experiment never reached statistical significance. Peeking would not have resulted in a false positive."

    return {
        "trajectory": trajectory,
        "early_stop_possible": early_stop_at_n is not None,
        "early_stop_at_n": early_stop_at_n,
        "final_pvalue": final_pvalue,
        "peeking_risk": peeking_risk,
        "interpretation": interpretation
    }

def run_bayesian_test(df: pd.DataFrame) -> dict:
    control_data = df[df[GROUP_COL] == CONTROL_LBL][CONVERTED_COL]
    treatment_data = df[df[GROUP_COL] == TREATMENT_LBL][CONVERTED_COL]
    
    c_conv = float(control_data.sum())
    c_fail = float(len(control_data) - c_conv)
    
    t_conv = float(treatment_data.sum())
    t_fail = float(len(treatment_data) - t_conv)
    
    alpha_prior = 1
    beta_prior = 1
    
    c_alpha = alpha_prior + c_conv
    c_beta = beta_prior + c_fail
    
    t_alpha = alpha_prior + t_conv
    t_beta = beta_prior + t_fail
    
    n_samples = 100000
    np.random.seed(42)
    
    c_samples = np.random.beta(c_alpha, c_beta, n_samples)
    t_samples = np.random.beta(t_alpha, t_beta, n_samples)
    
    prob_treatment_better = float(np.mean(t_samples > c_samples))
    
    loss_samples = np.maximum(c_samples - t_samples, 0)
    expected_loss = float(np.mean(loss_samples))
    
    diff_samples = t_samples - c_samples
    ci_lower = float(np.percentile(diff_samples, 2.5))
    ci_upper = float(np.percentile(diff_samples, 97.5))
    
    if prob_treatment_better > 0.95 and expected_loss < 0.01:
        recommendation = "Ship"
        interpretation = "The treatment is highly likely to be better than control, and the expected loss of being wrong is negligible. It is safe to ship."
    elif prob_treatment_better < 0.05:
        recommendation = "Do not ship"
        interpretation = "The treatment is highly likely to be worse than the control. Do not ship."
    else:
        recommendation = "Collect more data"
        interpretation = "There is not enough certainty yet to make a definitive decision. Collect more data to reduce the expected loss."
        
    return {
        "prob_treatment_better": round(prob_treatment_better, 4),
        "expected_loss": round(expected_loss, 4),
        "credible_interval": [round(ci_lower, 4), round(ci_upper, 4)],
        "recommendation": recommendation,
        "posterior_control": {"alpha": int(c_alpha), "beta": int(c_beta)},
        "posterior_treatment": {"alpha": int(t_alpha), "beta": int(t_beta)},
        "interpretation": interpretation
    }

def generate_summary(results: dict) -> str:
    ate = results["ate"]["ate"] * 100
    significant = results["ate"]["significant"]
    srm = results["srm"]["srm_detected"]
    cuped = results["cuped"].get("cuped_applied", False)
    
    summary = []
    
    if significant:
        summary.append(f"The treatment had a statistically significant impact, shifting the conversion rate by {ate:+.2f} percentage points.")
    else:
        summary.append(f"The treatment effect of {ate:+.2f} percentage points was not statistically significant, meaning we cannot rule out random chance.")
        
    if cuped:
        reduction = results["cuped"]["variance_reduction_pct"]
        summary.append(f"We applied variance reduction using pre-experiment data, reducing noise by {reduction:.1f}% to give a clearer result.")
        
    if srm:
        summary.append("Warning: A Sample Ratio Mismatch (SRM) was detected, indicating uneven traffic splitting that may invalidate these results.")
        
    return " ".join(summary)

def run_full_analysis(df: pd.DataFrame) -> dict:
    validate_csv(df)
    ate_results = compute_ate(df)
    cuped_results = apply_cuped(df)
    cate_results = compute_cate(df)
    srm_results = detect_srm(df)
    power_results = run_power_analysis(df)
    
    try:
        sequential_results = run_sequential_test(df)
    except Exception as e:
        sequential_results = {"error": str(e)}
        
    try:
        bayesian_results = run_bayesian_test(df)
    except Exception as e:
        bayesian_results = {"error": str(e)}
        
    results = {
        "ate": ate_results,
        "cuped": cuped_results,
        "cate": cate_results,
        "srm": srm_results,
        "power": power_results,
        "sequential": sequential_results,
        "bayesian": bayesian_results
    }
    
    results["summary"] = generate_summary(results)
    return results

def process_csv(csv_content):
    df = pd.read_csv(io.StringIO(csv_content))
    return json.dumps(run_full_analysis(df))
`;
