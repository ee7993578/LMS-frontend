import {
  LayoutDashboard, Building2, CreditCard, Settings, Users, Armchair,
  CalendarCheck, Wallet, Layers, FileBarChart, QrCode, Trophy,
  UserCircle, ScanLine, Clock, ListChecks, History,
} from "lucide-react";

export const SUPERADMIN_NAV = [
  { to: "/superadmin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/superadmin/libraries", label: "Libraries", icon: Building2 },
  { to: "/superadmin/plans", label: "Subscription Plans", icon: Layers },
  { to: "/superadmin/billing", label: "Billing & Invoices", icon: CreditCard },
  { to: "/superadmin/settings", label: "Settings", icon: Settings },
];

export const LIBRARY_ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/seats", label: "Seat Map", icon: Armchair },
  { to: "/admin/allocate", label: "Seat Allocation", icon: ListChecks },
  { to: "/admin/allocations", label: "Allocations", icon: History },
  { to: "/admin/slots", label: "Slot Management", icon: Clock },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/fees", label: "Fee Management", icon: Wallet },
  { to: "/admin/plans", label: "Plans", icon: Layers },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/qr", label: "QR Attendance", icon: QrCode },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const STUDENT_NAV = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/punch", label: "Punch In / Out", icon: ScanLine },
  { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
  { to: "/student/fees", label: "Fee Status", icon: Wallet },
  { to: "/student/seat", label: "My Seat", icon: Armchair },
  { to: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/student/profile", label: "Profile", icon: UserCircle },
];

export const NAV_BY_ROLE = {
  SUPERADMIN: SUPERADMIN_NAV,
  LIBRARY_ADMIN: LIBRARY_ADMIN_NAV,
  STUDENT: STUDENT_NAV,
};
