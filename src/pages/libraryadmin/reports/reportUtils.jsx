import { monthIdToLabel } from "../../../utils/format";

export function exportCSV(data, filename) {
  if (!data || !data.length) { alert("No data to export"); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","));
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
}

export const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];
export const statusTone = (s) => s === "PAID" ? "success" : s === "PARTIAL" ? "warning" : "danger";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">{title}</h2>
        {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

export function MobileCard({ title, subtitle, badge, badgeTone, rows }) {
  const toneClass = {
    success: "bg-green-500/15 text-green-400",
    warning: "bg-yellow-500/15 text-yellow-400",
    danger:  "bg-red-500/15 text-red-400",
    info:    "bg-blue-500/15 text-blue-400",
  }[badgeTone] || "bg-ink-700 text-ink-300";

  return (
    <div className="bg-ink-800 border border-ink-700 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-ink-100 text-sm">{title}</p>
          {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
        {badge && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${toneClass}`}>{badge}</span>}
      </div>
      {rows && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-ink-700">
          {rows.map((r, i) => (
            <div key={i}>
              <p className="text-[10px] text-ink-600 uppercase tracking-wide">{r.label}</p>
              <p className={`text-xs font-semibold mt-0.5 ${r.color || "text-ink-200"}`}>{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
