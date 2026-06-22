import { motion } from "framer-motion";
import PageHero from "../../components/landing/PageHero";
import CTASection from "../../components/landing/CTASection";

const VALUES = [
  { title: "Built from the seat up", desc: "Every screen starts from what a library admin or student actually does that day, not a generic admin panel template." },
  { title: "Quiet, focused design", desc: "Study spaces are calm environments. The product should feel the same — clear numbers, no clutter, no noise." },
  { title: "For India's study culture", desc: "Hourly seat rentals, monthly UPSC batches, exam-season rushes — designed around how libraries here actually run." },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About StudyHub"
        title="We build for the library next to your coaching center"
        subtitle="Not university libraries with book catalogues — the reading rooms, UPSC dens, and 24-hour study spaces that have quietly become India's third most common place to focus."
      />

      <section className="max-w-4xl mx-auto px-5 lg:px-8 pb-20">
        <div className="grid sm:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border border-ink-700 bg-ink-850 p-6"
            >
              <h3 className="font-display text-lg text-ink-50 mb-2">{v.title}</h3>
              <p className="text-sm text-ink-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 prose-like text-ink-300 leading-relaxed space-y-4 max-w-2xl mx-auto text-center">
          <p>
            StudyHub started after watching a library admin manage seat allocation, fee collection, and
            attendance across three notebooks and a WhatsApp group. We thought the operation deserved
            software as considered as the studying that happens inside it.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
