import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Timer, Armchair, Flame, Play } from "lucide-react";
import Button from "../ui/Button";
import { useCountUp } from "../../hooks/useCountUp";

function Stat({ value, suffix, label, delay }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <p className="font-display text-2xl sm:text-3xl text-ink-50">
        {Math.round(animated).toLocaleString("en-IN")}{suffix}
      </p>
      <p className="text-xs text-ink-400 mt-1">{label}</p>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 lamp-glow" />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 sm:pt-24 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-ink-800 border border-ink-600 px-3.5 py-1.5 text-xs text-ink-300 mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Built for UPSC, SSC & NEET study spaces across India
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-ink-50"
            >
              Run your study library<br />
              like a <span className="text-gradient-amber">national-grade SaaS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-ink-300 text-base sm:text-lg mt-5 max-w-lg leading-relaxed"
            >
              Seats, fees, plans, attendance and student progress — in one dashboard.
              Students punch in from their phone, you watch the library run itself.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 mt-8"
            >
              <Link to="/register-library">
                <Button size="lg">
                  Register your library <ArrowRight size={17} />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="secondary">
                  <Play size={16} /> See how it works
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-ink-700 max-w-md">
              <Stat value={142} suffix="+" label="Libraries onboard" delay={0.4} />
              <Stat value={18400} suffix="+" label="Students tracked" delay={0.45} />
              <Stat value={96} suffix="%" label="Seat utilization" delay={0.5} />
            </div>
          </div>

          {/* Floating dashboard preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-2xl shadow-[var(--shadow-soft-lg)] p-5 float-slow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-ink-400 font-medium">Library Admin · Live</span>
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-ring" /> Today
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-ink-800/80 p-3.5">
                  <Armchair size={16} className="text-teal-400 mb-2" />
                  <p className="font-display text-xl text-ink-50">84/96</p>
                  <p className="text-[11px] text-ink-400">Seats occupied</p>
                </div>
                <div className="rounded-xl bg-ink-800/80 p-3.5">
                  <Timer size={16} className="text-amber-400 mb-2" />
                  <p className="font-display text-xl text-ink-50">7.2h</p>
                  <p className="text-[11px] text-ink-400">Avg. study today</p>
                </div>
              </div>

              <div className="rounded-xl bg-ink-800/80 p-4">
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                      className="flex-1 rounded-md bg-gradient-to-t from-amber-500/40 to-amber-400"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-ink-400 mt-2">Attendance — last 7 days</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-6 glass rounded-xl p-3.5 shadow-[var(--shadow-soft)] hidden sm:block"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <Flame size={15} />
                </div>
                <div>
                  <p className="text-xs text-ink-100 font-medium">12-day streak</p>
                  <p className="text-[10px] text-ink-400">Priya S. · Rank #3</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
