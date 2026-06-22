import { useState } from "react";
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { initials } from "../../utils/format";

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-ink-950/80 backdrop-blur-md border-b border-ink-700 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-ink-300 hover:text-ink-50">
          <Menu size={22} />
        </button>
        <h1 className="font-display text-lg text-ink-50">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg flex items-center justify-center text-ink-300 hover:bg-ink-800 hover:text-amber-300 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center text-ink-300 hover:bg-ink-800 hover:text-ink-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-ink-800 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-amber-400 text-ink-950 flex items-center justify-center text-xs font-semibold">
              {initials(user?.username || "U")}
            </div>
            <span className="text-sm text-ink-200 hidden sm:inline max-w-28 truncate">
              {user?.username}
            </span>
            <ChevronDown size={14} className="text-ink-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-ink-850 border border-ink-600 rounded-xl shadow-[var(--shadow-soft-lg)] z-20 py-1.5 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft transition-colors"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
