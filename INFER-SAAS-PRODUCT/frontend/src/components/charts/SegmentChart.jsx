import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Layers } from "lucide-react";

const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-sm shadow-lg backdrop-blur">
      <p className="font-medium capitalize text-slate-900">{label}</p>
      <p
        className={`mt-0.5 font-mono text-xs ${v >= 0 ? "text-emerald-600" : "text-rose-600"}`}
      >
        CATE: {v >= 0 ? "+" : ""}
        {fmtPct(v)}
      </p>
    </div>
  );
};

export default function SegmentChart({ cate }) {
  const data = Object.entries(cate || {}).map(([segment, value]) => ({
    segment,
    value,
  }));

  return (
    <Card className="p-7" data-testid="segment-chart-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-500">
            <Layers className="h-4 w-4" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              CATE by segment
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Conditional Average Treatment Effect — heterogeneous response across
            user cohorts.
          </p>
        </div>
        <div className="hidden items-center gap-3 text-xs text-slate-500 sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> negative
          </span>
        </div>
      </div>

      <div className="mt-6 h-72" data-testid="segment-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 8, left: -8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="segment"
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
            />
            <YAxis
              tickFormatter={fmtPct}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <Tooltip
              content={<TooltipBox />}
              cursor={{ fill: "rgba(241,245,249,0.5)" }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
