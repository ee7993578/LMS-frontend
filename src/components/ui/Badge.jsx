import clsx from "clsx";

const tones = {
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  neutral: "bg-ink-700 text-ink-200 border-ink-600",
};

export default function Badge({ children, tone = "neutral", className, dot = false }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        tones[tone],
        className
      )}
    >
      {dot && <span className={clsx("h-1.5 w-1.5 rounded-full", `bg-current`)} />}
      {children}
    </span>
  );
}

// Map backend enum values to consistent tones across the app
export const STATUS_TONE = {
  ACTIVE: "success",
  PAID: "success",
  AVAILABLE: "success",
  IN: "success",
  INACTIVE: "neutral",
  PENDING: "warning",
  PARTIAL: "warning",
  GRACE: "warning",
  ALLOCATED: "info",
  OUT: "neutral",
  EXPIRED: "danger",
  UNPAID: "danger",
  EXCEEDED: "danger",
  UNDER_MAINTENANCE: "danger",
};
