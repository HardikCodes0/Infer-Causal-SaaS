import os
import re
from groq import Groq

SYSTEM_PROMPT = """
 Answer the user's question using 
causal reasoning, not just correlation. Be concise — 3 sentences 
max unless a longer answer is genuinely needed. Never say 
"I think" or "I believe" — speak with analytical confidence. 
If the question cannot be answered from the data provided, 
say exactly what additional data would be needed and why.
"""

def build_context(results: dict, experiment_meta: dict) -> str:
    lines = []
    
    if experiment_meta:
        if "name" in experiment_meta:
            lines.append(f"Experiment: {experiment_meta['name']}")
        if "hypothesis" in experiment_meta:
            lines.append(f"Hypothesis: {experiment_meta['hypothesis']}")

    if results and isinstance(results, dict):
        if "ate" in results and isinstance(results["ate"], dict):
            ate_dict = results["ate"]
            if "ate" in ate_dict:
                ate_val = float(ate_dict["ate"]) * 100
                direction = "+" if ate_val > 0 else ""
                lines.append(f"ATE: {direction}{ate_val:.2f} percentage points")
            if "p_value" in ate_dict:
                pval = float(ate_dict["p_value"])
                sig = "significant" if ate_dict.get("significant") else "not significant"
                lines.append(f"P-value: {pval:.4f} ({sig})")
            if "ci_lower" in ate_dict and "ci_upper" in ate_dict:
                ci_l = float(ate_dict["ci_lower"]) * 100
                ci_u = float(ate_dict["ci_upper"]) * 100
                lines.append(f"95% CI: [{ci_l:+.2f}%, {ci_u:+.2f}%]")

        if "srm" in results and isinstance(results["srm"], dict):
            srm_dict = results["srm"]
            if srm_dict.get("srm_detected"):
                lines.append("SRM: Detected — assignment may be broken")
            else:
                lines.append("SRM: Not detected")

        if "cuped" in results and isinstance(results["cuped"], dict):
            cuped_dict = results["cuped"]
            if cuped_dict.get("cuped_applied"):
                vr = float(cuped_dict.get("variance_reduction_pct", 0.0))
                lines.append(f"CUPED: Applied — {vr:.1f}% variance reduction")
            else:
                lines.append("CUPED: Not applied")

        if "cate" in results and isinstance(results["cate"], dict):
            cate_dict = results["cate"]
            segments = cate_dict.get("segments", [])
            if segments:
                seg_strs = []
                for seg in segments:
                    seg_ate = float(seg.get("ate", 0.0)) * 100
                    seg_strs.append(f"{seg.get('name')} {seg_ate:+.1f}%")
                lines.append(f"Segments: {', '.join(seg_strs)}")

        if "bayesian" in results and isinstance(results["bayesian"], dict):
            bayes_dict = results["bayesian"]
            if "prob_treatment_better" in bayes_dict:
                prob = float(bayes_dict["prob_treatment_better"]) * 100
                rec = bayes_dict.get("recommendation", "Unknown")
                lines.append(f"Bayesian: {prob:.1f}% probability treatment is better — Recommend: {rec}")

        if "sequential" in results and isinstance(results["sequential"], dict):
            seq_dict = results["sequential"]
            early = seq_dict.get("early_stop_possible")
            if early:
                at_n = seq_dict.get("early_stop_at_n", "unknown")
                lines.append(f"Sequential: Early stop possible at n={at_n}")
            else:
                lines.append("Sequential: Early stop not possible")

        if "power" in results and isinstance(results["power"], dict):
            pow_dict = results["power"]
            adq = "Yes" if pow_dict.get("adequately_powered") else "No"
            req = pow_dict.get("required_n", "unknown")
            act = pow_dict.get("actual_n", "unknown")
            lines.append(f"Power: Adequately powered? {adq} (Actual n={act}, Required n={req})")

        if "summary" in results:
            lines.append(f"Summary: {results['summary']}")
            
    return "\n".join(lines)[:3000] # Cap roughly at 600 tokens worth

def ask_interpreter(question: str, context: str, history: list = None) -> str:
    if history is None:
        history = []
        
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")
        
    try:
        client = Groq(api_key=api_key, timeout=5.0)
        messages = [{"role": "system", "content": SYSTEM_PROMPT.strip()}]
        messages.append({"role": "user", "content": f"Experiment context:\n{context}"})
        
        # history format is [{"role": "...", "content": "..."}, ...]
        # Cap history to last 6 messages
        history_capped = history[-6:] if len(history) > 6 else history
        for msg in history_capped:
            messages.append({"role": msg["role"], "content": msg["content"]})
            
        messages.append({"role": "user", "content": question})
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3,
            max_tokens=400,
        )
        
        response_text = completion.choices[0].message.content
        # Strip markdown code fences if present
        response_text = re.sub(r'```[a-zA-Z]*\n', '', response_text)
        response_text = response_text.replace('```', '')
        return response_text.strip()
        
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return "Analysis unavailable — try again in a moment"

def get_suggested_questions(results: dict) -> list[str]:
    questions = ["Explain this result to a non-technical PM"]
    
    if results and isinstance(results, dict):
        srm = results.get("srm", {}).get("srm_detected")
        if srm:
            questions.append("Why might the sample ratio be off?")
            
        segments = results.get("cate", {}).get("segments", [])
        if segments:
            # Check if one is 2x higher than average
            ates = [seg.get("ate", 0.0) for seg in segments if isinstance(seg, dict)]
            if ates:
                avg = sum(ates) / len(ates)
                for seg in segments:
                    if avg > 0 and seg.get("ate", 0.0) > 2 * avg:
                        questions.append(f"Should we ship only to {seg.get('name')} users?")
                        break
                        
        rec = results.get("bayesian", {}).get("recommendation")
        if rec == "Collect more data":
            questions.append("How many more users do we need?")
            
        seq_early = results.get("sequential", {}).get("early_stop_possible")
        if seq_early:
            questions.append("Could we have stopped this experiment earlier?")
            
        sig = results.get("ate", {}).get("significant")
        if sig is False:
            questions.append("What would make this result significant?")

    defaults = [
        "What are the main risks of this result?",
        "How confident can we be in this conclusion?",
        "What should our next steps be?"
    ]
    for d in defaults:
        if len(questions) < 3:
            questions.append(d)
            
    return questions[:3]
