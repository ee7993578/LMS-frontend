import { motion } from "framer-motion";
import {
  Armchair, ScanLine, Wallet, BarChart3, Trophy, Bell, Users, Building2,
  CalendarCheck, Layers, QrCode, MessageSquareWarning,
} from "lucide-react";
import PageHero from "../../components/landing/PageHero";
import CTASection from "../../components/landing/CTASection";

const GROUPS = [
  {
    title: "For library admins",
    items: [
      { icon: Users, label: "Student management", desc: "Add, edit, and track every student — profile, plan, fee history, and notes in one record." },
      { icon: Armchair, label: "Visual seat map", desc: "See available, occupied, and maintenance seats at a glance. Allocate or deallocate in two clicks." },
      { icon: Wallet, label: "Fee & plan management", desc: "Hourly, monthly, or custom plans with payable, received, balance, and concession tracking." },
      { icon: QrCode, label: "QR attendance", desc: "Generate a desk QR once — students scan it to punch in and out automatically." },
      { icon: BarChart3, label: "Reports", desc: "Attendance, revenue, seat utilization, and plan-wise breakdowns, exportable anytime." },
      { icon: MessageSquareWarning, label: "Notice board & complaints", desc: "Post notices to all students and resolve complaints without a WhatsApp group." },
    ],
  },
  {
    title: "For students",
    items: [
      { icon: ScanLine, label: "One-tap punch in/out", desc: "Start and end your study session from your phone — no separate hardware needed." },
      { icon: CalendarCheck, label: "Attendance history", desc: "See every session, study minutes, and break time across the month." },
      { icon: Trophy, label: "Streaks & leaderboard", desc: "Daily streaks and a library-wide leaderboard that turns discipline into a small game." },
      { icon: Wallet, label: "Fee status", desc: "Know exactly what's due, what's paid, and when your plan renews." },
    ],
  },
  {
    title: "For super admins",
    items: [
      { icon: Building2, label: "Multi-library oversight", desc: "Onboard, suspend, or review every library on the platform from one console." },
      { icon: Layers, label: "Subscription plans", desc: "Create and assign platform-level plans that cap student count and buffer slots per library." },
      { icon: Bell, label: "System monitoring", desc: "Activity and audit logs across every tenant, in one searchable timeline." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform features"
        title="Built around the actual day of a study library"
        subtitle="Every feature maps to something a library admin, student, or super admin does daily — not a generic checklist."
      />

      <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-24 space-y-20">
        {GROUPS.map((group, gi) => (
          <div key={group.title}>
            <h2 className="font-display text-2xl text-ink-50 mb-7">{group.title}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="rounded-2xl border border-ink-700 bg-ink-850 p-6 hover:border-ink-500 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <item.icon size={18} />
                  </div>
                  <h3 className="text-ink-50 font-medium mb-1.5">{item.label}</h3>
                  <p className="text-sm text-ink-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <CTASection />
    </>
  );
}
