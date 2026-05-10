// Mocked Causal Inference API.
// When a real backend is ready, replace `mockAnalyze` with `axios.post(...)`.

export const mockAnalyze = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          srm: { srm_detected: false, p_value: 0.43 },
          ate: { ate: 0.031, p_value: 0.021, ci_lower: 0.005, ci_upper: 0.057 },
          cuped: {
            available: true,
            cuped_ate: 0.034,
            variance_reduction_pct: 0.38,
          },
          cate: { new: 0.051, returning: 0.019, power: 0.008 },
          summary:
            "The treatment caused a statistically significant increase of 3.1% in conversion rate (p=0.021). CUPED variance reduction improved estimate precision by 38%. Effect is strongest among new users (+5.1%).",
        }),
      1500,
    ),
  );

export const mockAnalyzeSRM = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          srm: { srm_detected: true, p_value: 0.0003 },
          ate: { ate: 0.018, p_value: 0.12, ci_lower: -0.005, ci_upper: 0.041 },
          cuped: {
            available: true,
            cuped_ate: 0.021,
            variance_reduction_pct: 0.22,
          },
          cate: { new: 0.034, returning: 0.011, power: -0.014 },
          summary:
            "Sample Ratio Mismatch detected (p=0.0003) — randomisation appears compromised. The observed 1.8% lift is not statistically significant (p=0.12) and should not be trusted until the assignment pipeline is investigated.",
        }),
      1500,
    ),
  );
