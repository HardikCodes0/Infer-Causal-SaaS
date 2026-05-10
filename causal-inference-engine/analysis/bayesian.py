import pandas as pd
import numpy as np

def run_bayesian_test(df: pd.DataFrame) -> dict:
    variant_col = 'variant' if 'variant' in df.columns else 'group'
    metric_col = 'metric' if 'metric' in df.columns else 'converted'
    
    variants = df[variant_col].unique()
    if len(variants) != 2:
        return {"error": "Bayesian test requires exactly 2 variants."}
        
    control_name = variants[0]
    treatment_name = variants[1]
    
    control_data = df[df[variant_col] == control_name][metric_col]
    treatment_data = df[df[variant_col] == treatment_name][metric_col]
    
    # Calculate successes and failures for Beta distribution
    # This assumes metric is binary (0/1) for conversion
    c_conv = float(control_data.sum())
    c_fail = float(len(control_data) - c_conv)
    
    t_conv = float(treatment_data.sum())
    t_fail = float(len(treatment_data) - t_conv)
    
    # Beta(1, 1) flat prior
    alpha_prior = 1
    beta_prior = 1
    
    c_alpha = alpha_prior + c_conv
    c_beta = beta_prior + c_fail
    
    t_alpha = alpha_prior + t_conv
    t_beta = beta_prior + t_fail
    
    n_samples = 100000
    np.random.seed(42) # For reproducibility
    
    c_samples = np.random.beta(c_alpha, c_beta, n_samples)
    t_samples = np.random.beta(t_alpha, t_beta, n_samples)
    
    # 1. Probability treatment is better
    prob_treatment_better = float(np.mean(t_samples > c_samples))
    
    # 2. Expected Loss
    loss_samples = np.maximum(c_samples - t_samples, 0)
    expected_loss = float(np.mean(loss_samples))
    
    # 3. Credible Interval (95%)
    diff_samples = t_samples - c_samples
    ci_lower = float(np.percentile(diff_samples, 2.5))
    ci_upper = float(np.percentile(diff_samples, 97.5))
    
    # 4. Recommendation
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
