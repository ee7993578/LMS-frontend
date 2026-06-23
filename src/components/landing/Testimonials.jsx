import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { initials } from "../../utils/format";

const TESTIMONIALS = [
  {
    name: "Ramesh Kumar",
    role: "Owner, Horizon Study Center, Meerut",
    quote: "Earlier I tracked seat numbers on a notebook. Now I see vacant seats, pending fees, and today's attendance the moment I open my phone.",
  },
  {
    name: "Priya Sharma",
    role: "Admin, Aspire Library, Indore",
    quote: "Renewal reminders alone saved us at least 20,000 rupees a month in fees we used to simply forget to collect.",
  },
  {
    name: "Aditi Patel",
    role: "UPSC aspirant, student at Aspire Library",
    quote: "Seeing my study streak every morning genuinely keeps me coming back to the same seat at 6 AM.",
  },
  {
    name: "Mohit Verma",
    role: "Owner, Scholars Den, Lucknow",
    quote: "We run three branches now. StudyHub is the only reason I can see all of them from one dashboard.",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), []);
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const t = TESTIMONIALS[index];

  return (
    <section className="py-20 lg:py-28 max-w-4xl mx-auto px-5 lg:px-8">
      <div className="text-center mb-12">
        <p className="text-amber-400 text-sm font-semibold mb-3">Trusted by libraries across India</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ink-50">What library owners say</h2>
      </div>

      <div className="relative rounded-2xl border border-ink-700 bg-ink-850 p-8 sm:p-12 min-h-[260px] flex flex-col items-center justify-center text-center">
        <Quote className="text-amber-400/40 mb-5" size={32} />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className="font-display text-lg sm:text-xl text-ink-100 leading-relaxed max-w-xl">
              "{t.quote}"
            </p>
            <div className="flex items-center justify-center gap-3 mt-7">
              <div className="h-10 w-10 rounded-full bg-amber-400 text-white flex items-center justify-center text-sm font-semibold">
                {initials(t.name)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-ink-50">{t.name}</p>
                <p className="text-xs text-ink-400">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={prev} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-ink-800 border border-ink-600 flex items-center justify-center text-ink-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button onClick={next} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-ink-800 border border-ink-600 flex items-center justify-center text-ink-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-amber-400" : "w-1.5 bg-ink-600"}`}
          />
        ))}
      </div>
    </section>
  );
}
