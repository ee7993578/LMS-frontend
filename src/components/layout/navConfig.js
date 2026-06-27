import { FileText, LifeBuoy, Megaphone, UserPlus,
  LayoutDashboard, Building2, CreditCard, Settings, Users, Armchair,
  CalendarCheck, Wallet, Layers, FileBarChart, QrCode, Trophy,
  UserCircle, ScanLine, Clock, ListChecks, History, Home, Folder, CheckSquare,
  ShieldCheck, Receipt, MapPin, ClipboardList,
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
      { to: "/superadmin/plan-requests", label: "Plan Requests", icon: ClipboardList },
      { to: "/superadmin/billing", label: "Billing & Invoices", icon: CreditCard },
    ],
  },
  {
    groupId: "support",
    groupLabel: "Support & Comms",
    groupIcon: LifeBuoy,
    items: [
      { to: "/superadmin/tickets",       label: "Support Tickets",  icon: LifeBuoy },
      { to: "/superadmin/announcements", label: "Announcements",    icon: Megaphone },
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

// Library Admin NAV — each groupId = desktop tab
// Tab ordering & labels chosen for clarity
export const LIBRARY_ADMIN_NAV = [
  {
    groupId: "dashboard",
    groupLabel: "Dashboard",
    groupIcon: Home,
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    ],
  },
  {
    groupId: "students",
    groupLabel: "Students",
    groupIcon: Users,
    items: [
      { to: "/admin/students",      label: "All Students",          icon: Users    },
      { to: "/admin/registrations", label: "Pending Registrations", icon: UserPlus },
    ],
  },
  {
    groupId: "seats",
    groupLabel: "Seats",
    groupIcon: Armchair,
    items: [
      { to: "/admin/seats",        label: "Seat Map",          icon: MapPin },
      { to: "/admin/allocate",     label: "Allocate Seat",     icon: ListChecks },
      { to: "/admin/allocations",  label: "Active Allocations",icon: ClipboardList },
      { to: "/admin/slots",        label: "Slot Management",   icon: Clock },
    ],
  },
  {
    groupId: "attendance",
    groupLabel: "Attendance",
    groupIcon: CalendarCheck,
    items: [
      { to: "/admin/attendance", label: "Attendance Log",  icon: CalendarCheck },
      { to: "/admin/qr",         label: "QR Scanner",      icon: QrCode },
    ],
  },
  {
    groupId: "fees",
    groupLabel: "Fees",
    groupIcon: Wallet,
    items: [
      { to: "/admin/fees",                 label: "Fee Records",          icon: Wallet },
      { to: "/admin/payment-verification", label: "Verify Payments",      icon: ShieldCheck },
      { to: "/admin/payment",              label: "Payment Settings",     icon: Receipt },
    ],
  },
  {
    groupId: "plans",
    groupLabel: "Plans",
    groupIcon: Layers,
    items: [
      { to: "/admin/plans", label: "Membership Plans", icon: Layers },
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
    groupId: "support",
    groupLabel: "Support",
    groupIcon: LifeBuoy,
    items: [
      { to: "/admin/tickets", label: "Support Tickets", icon: LifeBuoy },
    ],
  },
  {
    groupId: "settings",
    groupLabel: "Settings",
    groupIcon: Settings,
    items: [
      { to: "/admin/settings", label: "Library Settings", icon: Settings },
    ],
  },
];

// All tab IDs for desktop horizontal nav (Library Admin)
export const LIBRARY_ADMIN_TAB_IDS = [
  "dashboard", "students", "registrations", "seats", "attendance", "fees", "plans", "reports", "support", "settings",
];

export const STUDENT_NAV = [
  {
    groupId: "overview",
    groupLabel: "Dashboard",
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
      { to: "/student/punch",      label: "Punch In / Out", icon: ScanLine },
      { to: "/student/attendance", label: "My Attendance",  icon: CalendarCheck },
    ],
  },
  {
    groupId: "fees",
    groupLabel: "Fees & Payment",
    groupIcon: Wallet,
    items: [
      { to: "/student/fees",          label: "Fee Status",    icon: Wallet },
      { to: "/student/deposit",       label: "Make Deposit",  icon: QrCode },
      { to: "/student/payment-proof", label: "Payment Proof", icon: Receipt },
      { to: "/student/receipts",      label: "My Receipts",   icon: FileText },
    ],
  },
  {
    groupId: "seat",
    groupLabel: "My Seat",
    groupIcon: Armchair,
    items: [
      { to: "/student/seat", label: "My Seat", icon: Armchair },
    ],
  },
  {
    groupId: "productivity",
    groupLabel: "Productivity",
    groupIcon: CheckSquare,
    items: [
      { to: "/student/todo",        label: "To-Do List",  icon: CheckSquare },
      { to: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    groupId: "account",
    groupLabel: "My Profile",
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
