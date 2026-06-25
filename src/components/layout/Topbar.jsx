import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";

// title prop ab library name hoga (Library Admin + Student ke liye)
// role prop se decide hoga kya dikhana hai
export default function Topbar({ onMenuClick, title, libraryName, role }) {
  const { user } = useAuth();

  // Mobile topbar me kya dikhaye heading ki jagah:
  // Library Admin → library ka naam
  // Student → library ka naam
  // SuperAdmin → "Super Admin"
  const displayTitle =
    (role === "LIBRARY_ADMIN" || role === "STUDENT") && libraryName
      ? libraryName
      : title;

  return (
    <header className="sticky top-0 z-30 h-16 bg-ink-950/80 backdrop-blur-md border-b border-ink-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-ink-300 hover:text-ink-50">
          <Menu size={22} />
        </button>
        <h1 className="font-display text-lg text-ink-50">{displayTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center text-ink-300 hover:bg-ink-800 hover:text-amber-300 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 pulse-ring" />
        </button>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-xs font-semibold shadow-[var(--shadow-glow-amber)]">
            {initials(user?.username || "U")}
          </div>
          <span className="text-sm text-ink-200 hidden sm:inline max-w-28 truncate">
            {user?.username}
          </span>
        </div>
      </div>
    </header>
  );
}
