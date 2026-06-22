import clsx from "clsx";
import { Inbox } from "lucide-react";
import Button from "./Button";

export function Skeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-lg bg-ink-700/60", className)} />;
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-850 p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function EmptyState({
  icon = <Inbox size={28} />,
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-14 w-14 rounded-2xl bg-ink-800 border border-ink-600 flex items-center justify-center text-amber-400 mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg text-ink-50 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-400 max-w-sm">{description}</p>}
      {actionLabel && (
        <Button className="mt-5" onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
