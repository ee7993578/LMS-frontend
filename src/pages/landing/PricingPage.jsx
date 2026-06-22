import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageHero from "../../components/landing/PageHero";
import PricingCards from "../../components/landing/PricingCards";
import CTASection from "../../components/landing/CTASection";

const FAQS = [
  { q: "Is there a setup fee?", a: "No. You can register your library and start configuring seats and plans immediately, free of any setup cost." },
  { q: "Can I change my plan later?", a: "Yes — you can upgrade or downgrade your subscription plan anytime from the Super Admin console without losing your data." },
  { q: "What happens if I exceed my student limit?", a: "Your library moves into a short grace buffer so existing students aren't disrupted, and you'll be prompted to upgrade your plan." },
  { q: "Do students need to install an app?", a: "No installation needed — students use the mobile web app directly from their phone's browser to punch in and out." },
];

export default function PricingPage() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Plans that scale with your seats"
        subtitle="Pay for the size of your library, not for features you'll never touch."
      />

      <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <PricingCards />
      </section>

      <section className="max-w-2xl mx-auto px-5 lg:px-8 pb-24">
        <h2 className="font-display text-2xl text-ink-50 mb-6 text-center">Common questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="rounded-xl border border-ink-700 bg-ink-850 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-ink-100">{f.q}</span>
                <ChevronDown size={16} className={`text-ink-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-ink-400 leading-relaxed">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  );
}
