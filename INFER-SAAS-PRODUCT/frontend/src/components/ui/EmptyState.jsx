import { FileSearch } from "lucide-react";

export const EmptyState = ({
  icon: Icon = FileSearch,
  title = "No experiment loaded yet",
  description = "Upload a CSV from your A/B test and we'll surface the lift, confidence interval, and segment-level effects in seconds.",
  action,
}) => (
  <div
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
    data-testid="empty-state"
  >
    <div className="relative">
      <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-emerald-100/40 blur-2xl" />
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
        <Icon className="h-6 w-6 text-slate-700" />
      </div>
    </div>
    <h3 className="mt-5 text-lg font-medium tracking-tight text-slate-900">
      {title}
    </h3>
    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
      {description}
    </p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
