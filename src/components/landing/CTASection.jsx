import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";

export default function CTASection() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-5 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden border border-amber-400/20 bg-ink-850 px-8 sm:px-14 py-14 text-center"
      >
        <div className="absolute inset-0 lamp-glow" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl text-ink-50 max-w-xl mx-auto leading-tight">
            Your library deserves better than a notebook.
          </h2>
          <p className="text-ink-400 mt-4 max-w-md mx-auto">
            Set up seats, plans, and your first students in under 15 minutes — no credit card required to start.
          </p>
          <Link to="/register-library" className="inline-block mt-8">
            <Button size="lg">
              Register your library <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
