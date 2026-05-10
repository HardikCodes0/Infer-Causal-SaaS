def generate_summary(results: dict) -> str:
    """Generates a plain English summary of the analysis results."""
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
