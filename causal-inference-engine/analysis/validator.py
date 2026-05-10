import pandas as pd

REQUIRED_COLS = {'user_id', 'group', 'converted'}
MIN_SAMPLE_SIZE = 30

def validate_csv(df: pd.DataFrame) -> dict:
    """Validates the uploaded CSV data for causal analysis."""
    errors = []
    
    missing_cols = REQUIRED_COLS - set(df.columns)
    if missing_cols:
        errors.append(f"Missing required columns: {', '.join(missing_cols)}")
        return {"valid": False, "errors": errors}
        
    for col in REQUIRED_COLS:
        if df[col].isnull().any():
            errors.append(f"Null values found in critical column: {col}")
            
    if 'group' in df.columns:
        counts = df['group'].value_counts()
        for group, count in counts.items():
            if count < MIN_SAMPLE_SIZE:
                errors.append(f"Group '{group}' has {count} users, minimum is {MIN_SAMPLE_SIZE}")
                
    return {"valid": len(errors) == 0, "errors": errors}
