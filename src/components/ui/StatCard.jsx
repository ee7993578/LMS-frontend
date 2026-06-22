import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";

export default function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  icon,
  trend,
  trendLabel,
  tone = "amber",
  loading = false,
}) {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  const display = typeof value === "number" ? animated.toFixed(decimals) : value;

  const toneClasses = {
    amber: "text-amber-400 bg-amber-500/10",
    teal: "text-teal-400 bg-teal-500/10",
    danger: "text-danger bg-danger-soft",
    info: "text-info bg-info-soft",
  };

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850 p-5 shadow-[var(--shadow-soft)] hover:border-ink-500 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
          {loading ? (
            <div className="h-8 w-20 mt-2 rounded-lg bg-ink-700/60 animate-pulse" />
          ) : (
            <p className="font-display text-2xl text-ink-50 mt-1.5 tabular-nums">
              {prefix}
              {display}
              {suffix}
            </p>
          )}
        </div>
        {icon && (
          <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center", toneClasses[tone])}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3 text-xs">
          <span
            className={clsx(
              "flex items-center gap-0.5 font-medium",
              trend >= 0 ? "text-success" : "text-danger"
            )}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </span>
          <span className="text-ink-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
