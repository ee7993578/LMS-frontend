import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import clsx from "clsx";
import { LIBRARY_ADMIN_NAV } from "./navConfig";
import { getMyLibrary } from "../../api/librarySettingsApi";
import { getMonthAttendance } from "../../api/attendanceApi";
import StatusBanner from "./StatusBanner";
import WelcomeModal from "../onboarding/WelcomeModal";
import FloatingHelpButton from "../onboarding/FloatingHelpButton";

/*
  Desktop Tab Bar — Library Admin only, hidden on mobile (lg:flex)
  Each tab = one group from LIBRARY_ADMIN_NAV.
  Click tab → activeTabId changes → Sidebar shows only that group's pages.
  Single-item groups: clicking navigates directly.
  Multi-item groups: sidebar shows items, first item auto-navigated on first click.
*/
function DesktopTabBar({ groups, activeTabId, onTabClick, pathname }) {
  return (
    <div className="hidden lg:flex items-center gap-0 border-b border-ink-700 bg-ink-950/80 backdrop-blur-md px-4 overflow-x-auto scrollbar-none shrink-0">
      {groups.map((group) => {
        const GroupIcon = group.groupIcon;
        const isActive =
          activeTabId === group.groupId ||
          group.items.some((item) =>
            item.end ? pathname === item.to : pathname.startsWith(item.to)
          );
        return (
          <button
            key={group.groupId}
            onClick={() => onTabClick(group.groupId)}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 -mb-px",
              isActive
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-ink-400 hover:text-ink-100 hover:border-ink-600"
            )}
          >
            <GroupIcon size={13} strokeWidth={2.25} />
            {group.groupLabel}
          </button>
        );
      })}
    </div>
  );
}

export default function DashboardLayout({ navItems, role, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isLibraryAdmin = role === "LIBRARY_ADMIN";
  const isStudent = role === "STUDENT";

  const [libraryName, setLibraryName] = useState("");

  // Active tab for Library Admin desktop
  const [activeTabId, setActiveTabId] = useState(() => {
    if (!isLibraryAdmin) return null;
    const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : [];
    const matched = groups.find((g) =>
      g.items.some((item) =>
        item.end ? pathname === item.to : pathname.startsWith(item.to)
      )
    );
    return matched?.groupId || (groups[0]?.groupId ?? null);
  });

  // Keep activeTabId in sync with route (e.g. NavLink clicks from sidebar)
  useEffect(() => {
    if (!isLibraryAdmin) return;
    const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : [];
    const matched = groups.find((g) =>
      g.items.some((item) =>
        item.end ? pathname === item.to : pathname.startsWith(item.to)
      )
    );
    if (matched && matched.groupId !== activeTabId) {
      setActiveTabId(matched.groupId);
    }
  }, [pathname]);

  const handleTabClick = (groupId) => {
    setActiveTabId(groupId);
    const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : [];
    const group = groups.find((g) => g.groupId === groupId);
    if (!group) return;
    // Always navigate to first item of the tab
    if (group.items.length >= 1) {
      navigate(group.items[0].to);
    }
  };

  // Fetch library name
  useEffect(() => {
    if (isLibraryAdmin) {
      getMyLibrary()
        .then(({ data }) => setLibraryName(data?.name || ""))
        .catch(() => {});
    } else if (isStudent) {
      getMonthAttendance()
        .then(({ data }) => {
          const arr = Array.isArray(data) ? data : [];
          const name = arr[0]?.libraryName;
          if (name) setLibraryName(name);
        })
        .catch(() => {});
    }
  }, [isLibraryAdmin, isStudent]);

  const groups = Array.isArray(navItems) && navItems[0]?.items ? navItems : null;

  return (
    <div className="min-h-screen flex bg-ink-950 grain-bg">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        role={role}
        libraryName={libraryName}
        activeTabId={activeTabId}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
          libraryName={libraryName}
          role={role}
        />

        {/* Desktop horizontal tabs — Library Admin only, hidden on mobile */}
        {isLibraryAdmin && groups && (
          <DesktopTabBar
            groups={groups}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            pathname={pathname}
          />
        )}

        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto page-animate">
          {(isLibraryAdmin || isStudent) && <StatusBanner />}
          <Outlet />
        </main>
      </div>

      {isLibraryAdmin && <WelcomeModal libraryName={libraryName} />}
      {isLibraryAdmin && <FloatingHelpButton />}
    </div>
  );
}
