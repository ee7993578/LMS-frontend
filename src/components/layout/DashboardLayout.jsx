import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Users, CalendarCheck, Wallet, LayoutDashboard } from "lucide-react";
import clsx from "clsx";

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  LIBRARY_ADMIN: "Library Admin",
  STUDENT: "Student",
};

// Desktop top-level tabs for Library Admin
// Each tab maps to a groupId in Sidebar
const LIBRARY_ADMIN_TABS = [
  {
    id: "students",
    label: "Students",
    icon: Users,
    routes: ["/admin/students"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarCheck,
    routes: ["/admin/attendance", "/admin/qr"],
  },
  {
    id: "fee",
    label: "Fee",
    icon: Wallet,
    routes: ["/admin/fees", "/admin/plans"],
  },
];

function DesktopTopTabs({ pathname }) {
  const activeTab = LIBRARY_ADMIN_TABS.find((t) =>
    t.routes.some((r) => pathname.startsWith(r))
  );

  return (
    <div className="hidden lg:flex items-center gap-1 border-b border-ink-700 bg-ink-950/80 backdrop-blur-md px-6">
      {LIBRARY_ADMIN_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.routes.some((r) => pathname.startsWith(r));
        return (
          <NavLink
            key={tab.id}
            to={tab.routes[0]}
            className={clsx(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
              isActive
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-ink-400 hover:text-ink-100 hover:border-ink-500"
            )}
          >
            <Icon size={15} />
            {tab.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function DashboardLayout({ navItems, role, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isLibraryAdmin = role === "LIBRARY_ADMIN";

  return (
    <div className="min-h-screen flex bg-ink-950 grain-bg">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        roleLabel={ROLE_LABELS[role]}
        role={role}
        currentPath={pathname}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        {/* Desktop horizontal tabs — only for Library Admin */}
        {isLibraryAdmin && <DesktopTopTabs pathname={pathname} />}
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto page-animate">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
