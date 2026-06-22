import { motion } from "framer-motion";

export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-14 lg:pt-20 lg:pb-16">
      <div className="absolute inset-0 lamp-glow" />
      <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {eyebrow && <p className="text-amber-400 text-sm font-semibold mb-3">{eyebrow}</p>}
          <h1 className="font-display text-3xl sm:text-5xl text-ink-50 leading-tight">{title}</h1>
          {subtitle && <p className="text-ink-400 mt-4 max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
}
