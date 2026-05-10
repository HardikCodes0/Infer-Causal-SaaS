import { Card } from "@/components/ui/card";

const InfoTooltip = ({ text }) => (
  <span className="group relative ml-1.5 inline-flex align-middle">
    <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-500 cursor-help transition-colors group-hover:bg-slate-300">
      ?
    </span>
    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-48 opacity-0 transition-opacity group-hover:opacity-100">
      <span className="block rounded bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white shadow-lg normal-case tracking-normal">
        {text}
      </span>
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </span>
  </span>
);

export default function StatCard({ label, value, hint, tone = "slate", tooltip }) {
  const tones = {
    slate: "text-slate-900",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };
  return (
    <Card className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </p>
      <p
        className={`mt-2 font-display text-3xl leading-none tracking-tight ${tones[tone]}`}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
