import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import PageHero from "../../components/landing/PageHero";

const POSTS = [
  { title: "Why seat-based pricing beats hourly guesswork", date: "12 Jun 2026", tag: "Operations", excerpt: "How three Indore libraries restructured their plans after switching to per-seat tracking." },
  { title: "The 21-day streak: building habits into your library app", date: "2 Jun 2026", tag: "Product", excerpt: "What gamified attendance actually does to student retention — and what it doesn't." },
  { title: "Running a multi-branch library on one dashboard", date: "20 May 2026", tag: "Guides", excerpt: "A practical walkthrough of managing two or more study centers as a single super admin." },
  { title: "Fee collection without the WhatsApp reminders", date: "8 May 2026", tag: "Operations", excerpt: "Automating renewal nudges cut late payments by a third for one Lucknow study center." },
];

export default function Blog() {
  return (
    <>
      <PageHero eyebrow="Blog" title="Notes on running a modern study space" />
      <section className="max-w-4xl mx-auto px-5 lg:px-8 pb-24 grid sm:grid-cols-2 gap-6">
        {POSTS.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-2xl border border-ink-700 bg-ink-850 p-6 flex flex-col hover:border-ink-500 transition-colors cursor-pointer"
          >
            <span className="text-xs font-medium text-amber-400 mb-3">{p.tag}</span>
            <h3 className="font-display text-lg text-ink-50 mb-2 leading-snug">{p.title}</h3>
            <p className="text-sm text-ink-400 leading-relaxed flex-1">{p.excerpt}</p>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-ink-700">
              <span className="flex items-center gap-1.5 text-xs text-ink-500">
                <Calendar size={12} /> {p.date}
              </span>
              <ArrowRight size={14} className="text-ink-500" />
            </div>
          </motion.article>
        ))}
      </section>
    </>
  );
}
