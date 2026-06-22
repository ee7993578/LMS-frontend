import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import clsx from "clsx";

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className={clsx(
              "relative w-full bg-ink-850 border border-ink-600 rounded-2xl shadow-[var(--shadow-soft-lg)] max-h-[90vh] flex flex-col",
              widths[size]
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
              <h3 className="font-display text-lg text-ink-50">{title}</h3>
              <button
                onClick={onClose}
                className="text-ink-400 hover:text-ink-100 hover:bg-ink-800 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto scrollbar-thin">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-ink-700 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({ open, onClose, title, children, side = "right" }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className={clsx(
              "absolute top-0 h-full w-full max-w-md bg-ink-850 border-ink-600 flex flex-col",
              side === "right" ? "right-0 border-l" : "left-0 border-r"
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
              <h3 className="font-display text-lg text-ink-50">{title}</h3>
              <button
                onClick={onClose}
                className="text-ink-400 hover:text-ink-100 hover:bg-ink-800 rounded-lg p-1.5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
