import { cn } from "@/lib/utils";

export const SkeletonLoader = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%]",
      className,
    )}
    style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
  />
);

export const ResultsSkeleton = () => (
  <div className="space-y-6" data-testid="results-skeleton">
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6"
        >
          <SkeletonLoader className="h-3 w-32" />
          <SkeletonLoader className="h-10 w-40" />
          <SkeletonLoader className="h-3 w-24" />
          <SkeletonLoader className="h-4 w-48" />
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
      <SkeletonLoader className="h-3 w-32" />
      <SkeletonLoader className="mt-5 h-56 w-full" />
    </div>
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
      <SkeletonLoader className="h-3 w-40" />
      <SkeletonLoader className="mt-3 h-4 w-full" />
      <SkeletonLoader className="mt-2 h-4 w-5/6" />
    </div>
  </div>
);
