import {
  LayoutDashboard, Building2, CreditCard, Settings, Users, Armchair,
  CalendarCheck, Wallet, Layers, FileBarChart, QrCode, Trophy,
  UserCircle, ScanLine, Clock, ListChecks, History, Home, Folder, CheckSquare,
  ShieldCheck, Receipt,
} from "lucide-react";

export const SUPERADMIN_NAV = [
  {
    groupId: "overview",
    groupLabel: "Overview",
    groupIcon: Home,
    items: [
      { to: "/superadmin", label: "Overview", icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupId: "tenants",
    groupLabel: "Libraries",
    groupIcon: Building2,
    items: [
      { to: "/superadmin/libraries", label: "Libraries", icon: Building2 },
    ],
  },
  {
    groupId: "billing",
    groupLabel: "Plans & Billing",
    groupIcon: CreditCard,
    items: [
      { to: "/superadmin/plans", label: "Subscription Plans", icon: Layers },
      { to: "/superadmin/billing", label: "Billing & Invoices", icon: CreditCard },
    ],
  },
  {
    groupId: "system",
    groupLabel: "System",
    groupIcon: Settings,
    items: [
      { to: "/superadmin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const LIBRARY_ADMIN_NAV = [
  {
    groupId: "overview",
    groupLabel: "Overview",
    groupIcon: Home,
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupId: "seating",
    groupLabel: "Seating",
    groupIcon: Armchair,
    items: [
      { to: "/admin/seats", label: "Seat Map", icon: Armchair },
      { to: "/admin/allocate", label: "Seat Allocation", icon: ListChecks },
      { to: "/admin/allocations", label: "Allocations", icon: History },
      { to: "/admin/slots", label: "Slot Management", icon: Clock },
    ],
  },
  {
    // FIXED: Students alag group
    groupId: "students",
    groupLabel: "Students",
    groupIcon: Users,
    items: [
      { to: "/admin/students", label: "Students", icon: Users },
    ],
  },
  {
    // FIXED: Attendance alag group
    groupId: "attendance",
    groupLabel: "Attendance",
    groupIcon: CalendarCheck,
    items: [
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/admin/qr", label: "QR Attendance", icon: QrCode },
    ],
  },
  {
    groupId: "fees",
    groupLabel: "Fees & Plans",
    groupIcon: Wallet,
    items: [
      { to: "/admin/fees", label: "Fee Management", icon: Wallet },
      { to: "/admin/payment", label: "Payment", icon: Receipt },
      { to: "/admin/payment-verification", label: "Payment Verification", icon: ShieldCheck },
      { to: "/admin/plans", label: "Plans", icon: Layers },
    ],
  },
  {
    groupId: "reports",
    groupLabel: "Reports",
    groupIcon: FileBarChart,
    items: [
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    groupId: "system",
    groupLabel: "System",
    groupIcon: Settings,
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

// Top-level tabs for LIBRARY_ADMIN desktop horizontal nav
export const LIBRARY_ADMIN_TOP_TABS = [
  { tabId: "students",   label: "Students",   icon: Users },
  { tabId: "attendance", label: "Attendance", icon: CalendarCheck },
  { tabId: "fees",       label: "Fee",        icon: Wallet },
];

export const STUDENT_NAV = [
  {
    groupId: "overview",
    groupLabel: "Overview",
    groupIcon: Home,
    items: [
      { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupId: "attendance",
    groupLabel: "Attendance",
    groupIcon: CalendarCheck,
    items: [
      { to: "/student/punch", label: "Punch In / Out", icon: ScanLine },
      { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
    ],
  },
  {
    groupId: "membership",
    groupLabel: "Membership",
    groupIcon: Wallet,
    items: [
      { to: "/student/fees", label: "Fee Status", icon: Wallet },
      { to: "/student/deposit", label: "Deposit", icon: QrCode },
      { to: "/student/payment-proof", label: "Payment Proof", icon: Receipt },
      { to: "/student/seat", label: "My Seat", icon: Armchair },
    ],
  },
  {
    groupId: "productivity",
    groupLabel: "Productivity",
    groupIcon: CheckSquare,
    items: [
      { to: "/student/todo", label: "To-Do List", icon: CheckSquare },
      { to: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    groupId: "account",
    groupLabel: "Account",
    groupIcon: UserCircle,
    items: [
      { to: "/student/profile", label: "Profile", icon: UserCircle },
    ],
  },
];

export const NAV_BY_ROLE = {
  SUPERADMIN: SUPERADMIN_NAV,
  LIBRARY_ADMIN: LIBRARY_ADMIN_NAV,
  STUDENT: STUDENT_NAV,
};

export const ICON_FALLBACK = Folder;
