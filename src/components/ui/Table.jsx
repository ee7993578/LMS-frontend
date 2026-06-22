import clsx from "clsx";
import { ChevronUp, ChevronDown } from "lucide-react";

/**
 * Table — desktop shows a real <table>, mobile shows cards.
 *
 * Usage:
 *   <Table mobileCardKey="fullName" columns={[{key,label,render?}]}>
 *     <THead>...</THead>
 *     <TBody>...</TBody>
 *   </Table>
 *
 * OR classic usage (no card mode):
 *   <Table><THead>...</THead><TBody>...</TBody></Table>
 */
export function Table({ children, className, mobileCardKey, columns, rows }) {
  // If rows + columns supplied → render responsive card/table automatically
  if (rows && columns) {
    return (
      <>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-ink-700 scrollbar-thin">
          <table className={clsx("w-full text-sm", className)}>
            <thead className="bg-ink-800/80 text-ink-300 text-xs uppercase tracking-wide">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.onSort}
                    className={clsx(
                      "px-4 py-3 text-left font-medium whitespace-nowrap",
                      col.onSort && "cursor-pointer hover:text-amber-300 select-none"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.onSort && (
                        <span className="flex flex-col -space-y-1 opacity-60">
                          <ChevronUp size={11} className={col.sortDir === "asc" ? "text-amber-400" : ""} />
                          <ChevronDown size={11} className={col.sortDir === "desc" ? "text-amber-400" : ""} />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {rows.map((row, ri) => (
                <tr key={row.id ?? ri} className="hover:bg-ink-800/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink-200 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {rows.map((row, ri) => (
            <div
              key={row.id ?? ri}
              className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-2.5"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-ink-400 uppercase tracking-wide shrink-0 mt-0.5">
                    {col.label}
                  </span>
                  <span className="text-sm text-ink-100 text-right">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  // Classic passthrough (existing usage)
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-700 scrollbar-thin">
      <table className={clsx("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="bg-ink-800/80 text-ink-300 text-xs uppercase tracking-wide">{children}</thead>;
}

export function TH({ children, sortable, sortDir, onSort, className }) {
  return (
    <th
      onClick={sortable ? onSort : undefined}
      className={clsx(
        "px-4 py-3 text-left font-medium whitespace-nowrap",
        sortable && "cursor-pointer hover:text-amber-300 select-none",
        className
      )}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="flex flex-col -space-y-1 opacity-60">
            <ChevronUp size={11} className={sortDir === "asc" ? "text-amber-400" : ""} />
            <ChevronDown size={11} className={sortDir === "desc" ? "text-amber-400" : ""} />
          </span>
        )}
      </div>
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-ink-700">{children}</tbody>;
}

export function TR({ children, className, ...props }) {
  return (
    <tr className={clsx("hover:bg-ink-800/50 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}

export function TD({ children, className }) {
  return <td className={clsx("px-4 py-3 text-ink-200 whitespace-nowrap", className)}>{children}</td>;
}

/**
 * ResponsiveTable — wraps Table + THead + TBody with automatic mobile card view.
 * 
 * columns: Array<{ key: string, label: string, render?: (row) => ReactNode, sortDir?: 'asc'|'desc', onSort?: fn }>
 * rows: Array<object>
 * loading: boolean
 * emptyMessage: string
 */
export function ResponsiveTable({ columns, rows, loading, emptyMessage = "No data found", className }) {
  return (
    <>
      {/* Desktop */}
      <div className={clsx("hidden sm:block overflow-x-auto rounded-xl border border-ink-700 scrollbar-thin", className)}>
        <table className="w-full text-sm">
          <THead>
            <tr>
              {columns.map((col) => (
                <TH
                  key={col.key}
                  sortable={!!col.onSort}
                  sortDir={col.sortDir}
                  onSort={col.onSort}
                  className={col.headerClass}
                >
                  {col.label}
                </TH>
              ))}
            </tr>
          </THead>
          <TBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TR key={i}>
                  {columns.map((col) => (
                    <TD key={col.key}>
                      <div className="h-4 rounded bg-ink-700 animate-pulse w-24" />
                    </TD>
                  ))}
                </TR>
              ))
            ) : rows.length === 0 ? (
              <TR>
                <TD className="text-center py-10 text-ink-400" colSpan={columns.length}>
                  {emptyMessage}
                </TD>
              </TR>
            ) : (
              rows.map((row, ri) => (
                <TR key={row.id ?? ri}>
                  {columns.map((col) => (
                    <TD key={col.key} className={col.cellClass}>
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </TD>
                  ))}
                </TR>
              ))
            )}
          </TBody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-2">
              <div className="h-4 rounded bg-ink-700 animate-pulse w-32" />
              <div className="h-3 rounded bg-ink-700 animate-pulse w-48" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-ink-700 bg-ink-850 p-8 text-center text-ink-400 text-sm">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row, ri) => (
            <div
              key={row.id ?? ri}
              className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-2.5"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-ink-400 uppercase tracking-wide shrink-0 mt-0.5 min-w-[80px]">
                    {col.label}
                  </span>
                  <span className="text-sm text-ink-100 text-right">
                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
