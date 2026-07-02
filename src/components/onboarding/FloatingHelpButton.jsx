import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Search, Layers, Armchair, UserPlus, CreditCard, PlayCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HELP_LINKS = [
  { icon: Layers, label: "How to Create Plans", route: "/admin/plans" },
  { icon: Armchair, label: "How to Create Seats", route: "/admin/seats" },
  { icon: UserPlus, label: "How Self Registration Works", route: "/admin/settings" },
  { icon: CreditCard, label: "How Payment Works", route: "/admin/payment" },
];

/** Mounted once in DashboardLayout for library-admin users. Purely additive UI — never blocks
 *  or auto-plays anything; the tutorial video link is opt-in only. */
export default function FloatingHelpButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = HELP_LINKS.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[var(--shadow-glow-amber)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Help"
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] bg-ink-850 border border-ink-600 rounded-2xl shadow-[var(--shadow-soft-lg)] overflow-hidden"
          >
            <div className="p-4 border-b border-ink-700">
              <p className="text-sm font-semibold text-ink-50 mb-2.5">Need a hand?</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search help..."
                  className="w-full h-9 pl-8 pr-3 rounded-lg bg-ink-800 border border-ink-700 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
              {filtered.map((l) => (
                <button
                  key={l.label}
                  onClick={() => { setOpen(false); navigate(l.route); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-200 hover:bg-ink-800 hover:text-ink-50 transition-colors text-left"
                >
                  <l.icon size={15} className="text-amber-400 shrink-0" />
                  <span className="flex-1">{l.label}</span>
                  <ChevronRight size={13} className="text-ink-600" />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-ink-500 text-center py-4">No results for "{query}"</p>
              )}

              <div className="my-2 border-t border-ink-800" />
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-400 hover:bg-ink-800 hover:text-ink-200 transition-colors cursor-not-allowed"
                title="Tutorial video coming soon"
              >
                <PlayCircle size={15} className="shrink-0" />
                <span className="flex-1">Watch Tutorial Video</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
