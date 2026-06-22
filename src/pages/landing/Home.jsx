import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import PricingCards from "../../components/landing/PricingCards";
import Testimonials from "../../components/landing/Testimonials";
import CTASection from "../../components/landing/CTASection";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />

      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-amber-400 text-sm font-semibold mb-3">Simple, transparent pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink-50">Pick a plan, scale as your library grows</h2>
        </div>
        <PricingCards compact />
        <div className="text-center mt-8">
          <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 font-medium">
            See full plan comparison <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <Testimonials />
      <CTASection />
    </>
  );
}
