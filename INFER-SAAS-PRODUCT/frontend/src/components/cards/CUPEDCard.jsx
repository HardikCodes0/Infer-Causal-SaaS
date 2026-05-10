import { TrendingDown, Sparkles } from "lucide-react";

export default function CUPEDCard({ cuped }) {
  if (!cuped?.available) return null;
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const reduction = Math.round(cuped.variance_reduction_pct * 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 p-7 shadow-[0_1px_2px_rgba(59,130,246,0.06),0_8px_24px_-12px_rgba(59,130,246,0.18)]"
      data-testid="cuped-card"
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            CUPED Adjusted ATE
          </h3>
        </div>
        <span className="rounded-full bg-white/80 px-2 py-0.5 font-mono text-[10px] font-medium text-blue-700">
          variance corrected
        </span>
      </div>

      <p
        className="relative mt-5 font-display text-6xl leading-none tracking-tight text-blue-950"
        data-testid="cuped-ate-value"
      >
        {cuped.cuped_ate >= 0 ? "+" : ""}
        {pct(cuped.cuped_ate)}
      </p>

      <div className="relative mt-7 flex items-end justify-between border-t border-blue-100 pt-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700/70">
            Variance reduction
          </p>
          <p
            className="mt-1 text-sm font-medium text-blue-900"
            data-testid="cuped-variance-reduction"
          >
            {reduction}% less variance needed
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-blue-700">
          <TrendingDown className="h-4 w-4" />
          <span className="font-mono text-sm">−{reduction}%</span>
        </div>
      </div>
    </div>
  );
}
