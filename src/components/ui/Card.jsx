import clsx from "clsx";

export default function Card({ children, className, glass = false, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-ink-700",
        glass ? "glass" : "bg-ink-850",
        hover && "transition-all duration-200 hover:border-ink-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft-lg)]",
        "shadow-[var(--shadow-soft)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx("p-5 border-b border-ink-700", className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={clsx("p-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={clsx("font-display text-lg text-ink-50", className)}>{children}</h3>;
}
