import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, BookOpenText } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";

const LINKS = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-ink-950/85 backdrop-blur-md border-b border-ink-700" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center text-ink-950">
            <BookOpenText size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display text-lg text-ink-50">StudyHub</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                clsx(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "text-amber-300" : "text-ink-300 hover:text-ink-50"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/register-library">
            <Button size="sm">Register your library</Button>
          </Link>
        </div>

        <button onClick={() => setOpen(true)} className="lg:hidden text-ink-200">
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink-950 lg:hidden">
          <div className="flex items-center justify-between h-16 px-5 border-b border-ink-700">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center text-ink-950">
                <BookOpenText size={18} />
              </div>
              <span className="font-display text-lg text-ink-50">StudyHub</span>
            </Link>
            <button onClick={() => setOpen(false)} className="text-ink-300">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col p-5 gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-base font-medium text-ink-200 hover:bg-ink-800"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-ink-700">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="secondary" className="w-full">Log in</Button>
              </Link>
              <Link to="/register-library" onClick={() => setOpen(false)}>
                <Button className="w-full">Register your library</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
