import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { BookOpenText, X } from "lucide-react";

export default function Sidebar({ navItems, mobileOpen, onCloseMobile, roleLabel }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink-950/70 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 border-r border-ink-700 flex flex-col z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center text-ink-950">
              <BookOpenText size={18} strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-display text-sm text-ink-50 leading-none">StudyHub</p>
              <p className="text-[10px] text-ink-400 leading-none mt-0.5">{roleLabel}</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-ink-400 hover:text-ink-100">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                    : "text-ink-300 hover:bg-ink-800 hover:text-ink-50 border border-transparent"
                )
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ink-700">
          <div className="rounded-xl bg-ink-800 border border-ink-600 p-3.5">
            <p className="text-xs text-ink-300 leading-relaxed">
              Need help? <span className="text-amber-400 font-medium">Visit support</span> or check your library admin.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
