import { motion } from "framer-motion";
import { Armchair, ScanLine, Wallet, BarChart3, Trophy, Bell } from "lucide-react";

const FEATURES = [
  {
    icon: Armchair,
    title: "Visual seat allocation",
    desc: "Drag-and-drop seat maps with live status — available, occupied, reserved, or under maintenance.",
    tone: "teal",
  },
  {
    icon: ScanLine,
    title: "QR punch in / punch out",
    desc: "Students scan a desk QR or tap one button from their phone. Study hours calculate themselves.",
    tone: "amber",
  },
  {
    icon: Wallet,
    title: "Fee & plan management",
    desc: "Hourly, monthly, or custom plans. Track dues, receipts, and renewals without a single Excel sheet.",
    tone: "info",
  },
  {
    icon: BarChart3,
    title: "Reports that matter",
    desc: "Seat utilization, revenue trends, and attendance — the numbers a library owner actually checks daily.",
    tone: "teal",
  },
  {
    icon: Trophy,
    title: "Student gamification",
    desc: "Streaks, leaderboards, and study-hour milestones that keep aspirants coming back to their seat.",
    tone: "amber",
  },
  {
    icon: Bell,
    title: "Renewal reminders",
    desc: "Automatic nudges before a plan expires — for the student, and for the admin who tracks them.",
    tone: "info",
  },
];

const TONE_CLASSES = {
  teal: "bg-teal-500/10 text-teal-400",
  amber: "bg-amber-500/10 text-amber-400",
  info: "bg-info-soft text-info",
};

export default function Features() {
  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-5 lg:px-8">
      <div className="max-w-2xl mb-14">
        <p className="text-amber-400 text-sm font-semibold mb-3">Everything a library admin actually needs</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink-50 leading-tight">
          Not a books catalogue. A study-space operating system.
        </h2>
        <p className="text-ink-400 mt-4 leading-relaxed">
          StudyHub was built for the new wave of reading rooms and co-working study spaces —
          where the product is focused hours, not book checkouts.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-ink-700 bg-ink-850 p-6 hover:border-ink-500 hover:-translate-y-1 transition-all duration-200"
          >
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${TONE_CLASSES[f.tone]}`}>
              <f.icon size={20} />
            </div>
            <h3 className="font-display text-lg text-ink-50 mb-2">{f.title}</h3>
            <p className="text-sm text-ink-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
