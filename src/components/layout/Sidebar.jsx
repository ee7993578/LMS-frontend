import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { BookOpenText, X, ChevronDown } from "lucide-react";

// Groups that appear as top tabs on desktop for Library Admin
// These are shown in sidebar only on mobile
const LIBRARY_ADMIN_TAB_GROUPS = ["students", "attendance", "fees"];

function isGroupActive(group, pathname) {
  return group.items.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );
}

function SidebarGroup({ group, pathname, onNavigate }) {
  const active = isGroupActive(group, pathname);
  const [open, setOpen] = useState(active);
  const GroupIcon = group.groupIcon;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors",
          active ? "text-amber-300" : "text-ink-400 hover:text-ink-100"
        )}
      >
        <span className="flex items-center gap-2.5">
          <GroupIcon size={15} strokeWidth={2.25} />
          {group.groupLabel}
        </span>
        <ChevronDown
          size={14}
          className={clsx("transition-transform duration-300", open ? "rotate-180" : "rotate-0")}
        />
      </button>

      <div className={clsx("submenu-wrap", open && "open")}>
        <div className="submenu-inner">
          <div className="pl-2 pr-1 pb-1 pt-0.5 space-y-0.5">
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border",
                    isActive
                      ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                      : "text-ink-300 hover:bg-ink-800 hover:text-ink-50 border-transparent"
                  )
                }
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ navItems, mobileOpen, onCloseMobile, roleLabel, role, currentPath }) {
  const { pathname } = useLocation();
  const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : null;
  const isLibraryAdmin = role === "LIBRARY_ADMIN";

  // Which tab groups to show in sidebar?
  // Desktop: hide tab groups (they show in horizontal tabs above)
  // Mobile: show all groups always
  const filterGroup = (group) => {
    if (!isLibraryAdmin) return true;
    // On mobile (mobileOpen context) — show all; on desktop hide tab groups
    // We use CSS hidden/block trick: render always but hide with class on desktop
    return true; // We'll use CSS classes on the wrapper
  };

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
          "drawer-panel lg:!transform-none fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-900 border-r border-ink-700 flex flex-col z-50",
          mobileOpen && "open"
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-ink-700 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 topbar-shimmer">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center text-white border border-white/20">
              <BookOpenText size={18} strokeWidth={2.25} />
            </div>
            <div>
              <p className="font-display text-sm text-white leading-none">StudyHub</p>
              <p className="text-[10px] text-white/75 leading-none mt-0.5">{roleLabel}</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {groups
            ? groups.map((group) => {
                // For Library Admin: tab groups hidden on desktop, shown on mobile
                const isTabGroup = isLibraryAdmin && LIBRARY_ADMIN_TAB_GROUPS.includes(group.groupId);
                return (
                  <div
                    key={group.groupId}
                    className={isTabGroup ? "lg:hidden" : ""}
                  >
                    <SidebarGroup
                      group={group}
                      pathname={pathname}
                      onNavigate={onCloseMobile}
                    />
                  </div>
                );
              })
            : navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-1 border",
                      isActive
                        ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
                        : "text-ink-300 hover:bg-ink-800 hover:text-ink-50 border-transparent"
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
