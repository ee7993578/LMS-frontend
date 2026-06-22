import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  LIBRARY_ADMIN: "Library Admin",
  STUDENT: "Student",
};

export default function DashboardLayout({ navItems, role, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-ink-950 grain-bg">
      <Sidebar
        navItems={navItems}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        roleLabel={ROLE_LABELS[role]}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
