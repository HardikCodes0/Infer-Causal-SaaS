import { Sparkles, Quote } from "lucide-react";

export default function SummaryCard({ summary }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white"
      data-testid="summary-card"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative flex items-center gap-2 text-emerald-400">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          Plain-English summary
        </h3>
      </div>
      <Quote className="absolute right-6 top-6 h-10 w-10 text-white/10" />
      <p
        className="relative mt-4 font-display text-2xl italic leading-snug text-white"
        data-testid="summary-text"
      >
        {summary}
      </p>
      <div className="relative mt-5 flex items-center gap-3 text-xs text-white/60">
        <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono">
          inference engine v0.4
        </span>
        <span>Generated from your CSV in under 2 seconds</span>
      </div>
    </div>
  );
}
