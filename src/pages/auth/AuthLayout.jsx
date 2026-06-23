import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpenText, Timer, Armchair, TrendingUp } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-ink-950">
      {/* Left: form */}
      <div className="w-full lg:w-[480px] flex flex-col px-6 sm:px-10 py-8">
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-lg bg-amber-400 flex items-center justify-center text-white">
            <BookOpenText size={20} strokeWidth={2.25} />
          </div>
          <span className="font-display text-lg text-ink-50">StudyHub</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-2xl text-ink-50 mb-1.5">{title}</h1>
            {subtitle && <p className="text-sm text-ink-400 mb-7">{subtitle}</p>}
            {children}
          </motion.div>
        </div>

        <p className="text-xs text-ink-500 text-center mt-8">
          © {new Date().getFullYear()} StudyHub ERP. Built for India's study spaces.
        </p>
      </div>

      {/* Right: visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-ink-900 items-center justify-center">
        <div className="absolute inset-0 lamp-glow" />
        <div className="absolute inset-0 grain-bg" />

        <div className="relative z-10 max-w-md px-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-6 shadow-[var(--shadow-soft-lg)] float-slow"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-ink-400 font-medium">Today's focus</span>
              <span className="h-2 w-2 rounded-full bg-success pulse-ring" />
            </div>
            <div className="flex items-end gap-2 mb-1">
              <Timer className="text-amber-400 mb-1" size={22} />
              <span className="font-display text-3xl text-ink-50">6h 42m</span>
            </div>
            <p className="text-xs text-ink-400 mb-5">Across 3 study sessions today</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-800/80 p-3">
                <Armchair size={16} className="text-teal-400 mb-1.5" />
                <p className="text-xs text-ink-400">Seat</p>
                <p className="text-sm text-ink-100 font-medium">A-14</p>
              </div>
              <div className="rounded-xl bg-ink-800/80 p-3">
                <TrendingUp size={16} className="text-amber-400 mb-1.5" />
                <p className="text-xs text-ink-400">Streak</p>
                <p className="text-sm text-ink-100 font-medium">12 days</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-xl p-4 mt-4 ml-12 max-w-[260px] shadow-[var(--shadow-soft)]"
          >
            <p className="text-xs text-ink-300">
              <span className="text-amber-300 font-medium">142 libraries</span> across India run on StudyHub today.
            </p>
          </motion.div>

          <h2 className="font-display text-2xl text-ink-50 mt-10 leading-snug">
            One seat.<br />One streak.<br />
            <span className="text-gradient-amber">One focused you.</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
