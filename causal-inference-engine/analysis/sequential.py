import pandas as pd
import numpy as np
from scipy.stats import ttest_ind

def run_sequential_test(df: pd.DataFrame) -> dict:
    if 'timestamp' in df.columns:
        df = df.sort_values('timestamp')
    
    variant_col = 'variant' if 'variant' in df.columns else 'group'
    metric_col = 'metric' if 'metric' in df.columns else 'converted'
    
    trajectory = []
    n_users = len(df)
    
    variants = df[variant_col].unique()
    if len(variants) != 2:
        return {"error": "SPRT requires exactly 2 variants."}
        
    control_name = variants[0]
    treatment_name = variants[1]
    
    early_stop_at_n = None
    crosses = 0
    was_significant = False
    
    # Compute at each step of 10 users
    step_size = 10
    
    for i in range(step_size, n_users + 1, step_size):
        current_data = df.iloc[:i]
        
        control_data = current_data[current_data[variant_col] == control_name][metric_col]
        treatment_data = current_data[current_data[variant_col] == treatment_name][metric_col]
        
        if len(control_data) < 2 or len(treatment_data) < 2:
            continue
            
        stat, pval = ttest_ind(treatment_data, control_data, equal_var=False)
        ate = treatment_data.mean() - control_data.mean()
        
        is_sig = not np.isnan(pval) and pval < 0.05
        
        if is_sig and not was_significant:
            crosses += 1
            if early_stop_at_n is None:
                early_stop_at_n = i
        
        if not is_sig and was_significant:
            crosses += 1  # count crossing back
            
        was_significant = is_sig
        
        trajectory.append({
            "users_seen": i,
            "pvalue": float(pval) if not np.isnan(pval) else 1.0,
            "ate": float(ate) if not np.isnan(ate) else 0.0
        })
        
    # Evaluate the full dataset if there are leftover users not in step of 10
    if n_users % step_size != 0:
        control_data = df[df[variant_col] == control_name][metric_col]
        treatment_data = df[df[variant_col] == treatment_name][metric_col]
        if len(control_data) >= 2 and len(treatment_data) >= 2:
            stat, pval = ttest_ind(treatment_data, control_data, equal_var=False)
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
    elif crosses == 1 and early_stop_at_n > n_users * 0.8:
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
