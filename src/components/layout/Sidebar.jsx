import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  BookOpenText, X, Sun, Moon, LogOut,
  ChevronRight, Armchair, CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getMySeat, getMyFees } from "../../api/studentApi";
import { initials } from "../../utils/format";

function getActiveGroupId(groups, pathname) {
  const matched = groups.find((g) =>
    g.items.some((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to)
    )
  );
  return matched?.groupId ?? groups[0]?.groupId ?? null;
}

function SidebarGroup({ group, isOpen, onToggle, pathname, onNavigate }) {
  const GroupIcon = group.groupIcon;
  const isGroupActive = group.items.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150",
          isGroupActive
            ? "text-amber-300 bg-amber-400/8"
            : "text-ink-500 hover:text-ink-200 hover:bg-ink-800/60"
        )}
      >
        <span className="flex items-center gap-2">
          <GroupIcon
            size={14}
            strokeWidth={2.25}
            className={clsx(
              "shrink-0 transition-colors",
              isGroupActive ? "text-amber-400" : "text-ink-500 group-hover:text-ink-300"
            )}
          />
          {group.groupLabel}
        </span>
        <ChevronRight
          size={13}
          strokeWidth={2.5}
          className={clsx(
            "shrink-0 transition-transform duration-200",
            isOpen ? "rotate-90" : "rotate-0",
            isGroupActive ? "text-amber-400" : "text-ink-600"
          )}
        />
      </button>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-0.5 pb-1 pl-3 pr-1 space-y-0.5">
          {group.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 border-l-2 pl-[10px]",
                  isActive
                    ? "bg-gradient-to-r from-amber-400/15 to-amber-400/5 text-amber-300 border-amber-400"
                    : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/70 border-transparent"
                )
              }
            >
              <Icon size={15} strokeWidth={2} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  navItems,
  mobileOpen,
  onCloseMobile,
  role,
  libraryName,
  activeTabId,
}) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isLibraryAdmin = role === "LIBRARY_ADMIN";
  const isStudent = role === "STUDENT";
  const isSuperAdmin = role === "SUPERADMIN";

  const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : null;

  // Student quick info
  const [seatNumber, setSeatNumber] = useState(null);
  const [feeStatus, setFeeStatus] = useState(null);

  useEffect(() => {
    if (!isStudent) return;
    getMySeat()
      .then(({ data }) => setSeatNumber(data?.seatNumber || data?.seatName || null))
      .catch(() => {});
    getMyFees()
      .then(({ data }) => {
        const arr = Array.isArray(data) ? data : [];
        if (!arr.length) return;
        const latest = arr.reduce((a, b) => (b.monthId > a.monthId ? b : a), arr[0]);
        setFeeStatus(latest?.feeStatus || null);
      })
      .catch(() => {});
  }, [isStudent]);

  // One-at-a-time accordion state — default: active route's group
  const [openGroupId, setOpenGroupId] = useState(() =>
    groups ? getActiveGroupId(groups, pathname) : null
  );

  // Sync when route changes (e.g. desktop tab click navigates)
  useEffect(() => {
    if (!groups) return;
    const activeId = getActiveGroupId(groups, pathname);
    if (activeId) setOpenGroupId(activeId);
  }, [pathname]);

  const toggleGroup = (groupId) => {
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onCloseMobile?.();
  };

  // Desktop Library Admin: only show activeTabId group (force open, no accordion needed)
  // Mobile or other roles: show all groups with accordion
  const visibleGroups = (() => {
    if (!groups) return null;
    if (!isLibraryAdmin) return groups;
    if (activeTabId && !mobileOpen) {
      const g = groups.find((gr) => gr.groupId === activeTabId);
      return g ? [g] : [];
    }
    return groups;
  })();

  const feeColor =
    feeStatus === "PAID" ? "text-emerald-400" :
    feeStatus === "PARTIAL" ? "text-amber-400" :
    feeStatus ? "text-red-400" : "text-ink-500";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink-950/75 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={clsx(
          "drawer-panel lg:!transform-none fixed lg:sticky top-0 left-0 h-screen w-[260px] flex flex-col z-50",
          "bg-ink-900 border-r border-ink-700/60",
          mobileOpen && "open"
        )}
      >
        {/* ── Brand header ── */}
        <div className="relative flex items-center gap-3 px-4 h-16 shrink-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 topbar-shimmer">
          <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white border border-white/25 shrink-0">
            <BookOpenText size={17} strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[13px] font-semibold text-white leading-tight truncate">
              {(isLibraryAdmin || isStudent) && libraryName ? libraryName : "StudyHub"}
            </p>
            <p className="text-[10px] text-white/70 leading-tight mt-0.5">
              {isLibraryAdmin ? "Library Admin"
                : isStudent ? "Student Portal"
                : isSuperAdmin ? "Super Admin" : ""}
            </p>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden h-7 w-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Student chips only (no duplicate user card) ── */}
        {isStudent && (
          <div className="px-3 pt-2.5 pb-2 border-b border-ink-700/60 shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 bg-ink-800/50 border border-ink-700/40 rounded-lg px-2 py-1.5">
                <Armchair size={11} className="text-amber-400 shrink-0" />
                <span className="text-[11px] text-ink-400 truncate">
                  {seatNumber ? `Seat ${seatNumber}` : "No Seat"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-ink-800/50 border border-ink-700/40 rounded-lg px-2 py-1.5">
                <CreditCard size={11} className="text-amber-400 shrink-0" />
                <span className={`text-[11px] truncate font-medium ${feeColor}`}>
                  {feeStatus || "No Fee"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
          {visibleGroups
            ? visibleGroups.map((group) => {
                // Desktop single-group view: force open, no toggle header needed
                const isSingleDesktop = visibleGroups.length === 1 && !mobileOpen;
                if (isSingleDesktop) {
                  return (
                    <div key={group.groupId} className="space-y-0.5">
                      {group.items.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={end}
                          onClick={onCloseMobile}
                          className={({ isActive }) =>
                            clsx(
                              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all border-l-2 pl-[10px]",
                              isActive
                                ? "bg-gradient-to-r from-amber-400/15 to-amber-400/5 text-amber-300 border-amber-400"
                                : "text-ink-400 hover:text-ink-100 hover:bg-ink-800/70 border-transparent"
                            )
                          }
                        >
                          <Icon size={15} strokeWidth={2} className="shrink-0" />
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  );
                }
                return (
                  <SidebarGroup
                    key={group.groupId}
                    group={group}
                    isOpen={openGroupId === group.groupId}
                    onToggle={() => toggleGroup(group.groupId)}
                    pathname={pathname}
                    onNavigate={onCloseMobile}
                  />
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
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all mb-0.5 border-l-2",
                      isActive
                        ? "bg-amber-400/10 text-amber-300 border-amber-400"
                        : "text-ink-400 hover:bg-ink-800 hover:text-ink-50 border-transparent"
                    )
                  }
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </NavLink>
              ))}
        </nav>

        {/* ── Bottom: Theme + Logout ── */}
        <div className="px-3 pb-4 pt-2 border-t border-ink-700/60 space-y-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-ink-400 hover:text-ink-100 hover:bg-ink-800/70 transition-all"
          >
            {theme === "dark" ? (
              <><Sun size={15} className="text-amber-400 shrink-0" /><span>Light Mode</span></>
            ) : (
              <><Moon size={15} className="text-indigo-400 shrink-0" /><span>Dark Mode</span></>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/8 transition-all"
          >
            <LogOut size={15} className="shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
