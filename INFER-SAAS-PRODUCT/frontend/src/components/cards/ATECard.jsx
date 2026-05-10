import { CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fmt = (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;

export default function ATECard({ ate }) {
  const significant = ate.p_value < 0.05;
  const borderline = !significant && ate.p_value < 0.1;

  const badge = significant
    ? { tone: "emerald", Icon: CheckCircle2, label: "Significant" }
    : borderline
      ? { tone: "amber", Icon: AlertTriangle, label: "Borderline" }
      : { tone: "slate", Icon: AlertTriangle, label: "Not significant" };

  return (
    <Card className="p-7" data-testid="ate-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Activity className="h-4 w-4" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            Average Treatment Effect
          </h3>
        </div>
        <Badge tone={badge.tone} data-testid="ate-significance-badge">
          <badge.Icon className="h-3.5 w-3.5" />
          {badge.label} · p = {ate.p_value.toFixed(3)}
        </Badge>
      </div>

      <p
        className={`mt-5 font-display text-6xl leading-none tracking-tight ${
          ate.ate >= 0 ? "text-slate-950" : "text-rose-600"
        }`}
        data-testid="ate-value"
      >
        {fmt(ate.ate)}
      </p>

      <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            95% Confidence Interval
          </p>
          <p
            className="mt-1 font-mono text-sm text-slate-700"
            data-testid="ate-ci"
          >
            [{fmt(ate.ci_lower)}, {fmt(ate.ci_upper)}]
          </p>
        </div>
        <CIBar lower={ate.ci_lower} upper={ate.ci_upper} point={ate.ate} />
      </div>
    </Card>
  );
}

const CIBar = ({ lower, upper, point }) => {
  const span = Math.max(Math.abs(lower), Math.abs(upper)) * 1.4 || 0.05;
  const toPct = (v) => ((v + span) / (2 * span)) * 100;
  return (
    <div className="relative h-6 w-32">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-emerald-500/30"
        style={{
          left: `${toPct(lower)}%`,
          width: `${toPct(upper) - toPct(lower)}%`,
        }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-600 shadow"
        style={{ left: `${toPct(point)}%` }}
      />
    </div>
  );
};
