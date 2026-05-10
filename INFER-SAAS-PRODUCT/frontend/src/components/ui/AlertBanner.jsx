import { AlertOctagon } from "lucide-react";

export const AlertBanner = ({
  tone = "rose",
  icon: Icon = AlertOctagon,
  title,
  description,
  meta,
  ...rest
}) => {
  const tones = {
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div
      role="alert"
      className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${tones[tone]}`}
      {...rest}
    >
      <div className="mt-0.5 rounded-full bg-white/70 p-1.5">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && (
          <p className="mt-1 text-sm leading-relaxed opacity-90">
            {description}
          </p>
        )}
        {meta && <div className="mt-2 text-xs opacity-80">{meta}</div>}
      </div>
    </div>
  );
};
