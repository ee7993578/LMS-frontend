import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import { getPublicPlans } from "../../api/publicApi";

const FALLBACK_PLANS = [
  { planId: "starter", planName: "Starter", planPrice: 999, noOfStudent: 60, bufferStudent: 5, noOfDays: 30 },
  { planId: "growth", planName: "Growth", planPrice: 1999, noOfStudent: 150, bufferStudent: 15, noOfDays: 30, popular: true },
  { planId: "scale", planName: "Scale", planPrice: 3499, noOfStudent: 400, bufferStudent: 40, noOfDays: 30 },
];

const PERKS = [
  "Unlimited seats & seat maps",
  "QR + mobile attendance",
  "Fee collection & receipts",
  "Student leaderboard & streaks",
  "Email + push reminders",
];

export default function PricingCards({ compact = false }) {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPlans()
      .then(({ data }) => {
        if (data && data.length > 0) setPlans(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={clsx("grid sm:grid-cols-2 lg:grid-cols-3 gap-6", compact && "max-w-5xl mx-auto")}>
      {plans.map((plan, i) => {
        const popular = plan.popular || i === 1;
        return (
          <motion.div
            key={plan.planId}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={clsx(
              "relative rounded-2xl p-7 flex flex-col",
              popular
                ? "bg-ink-850 border-2 border-amber-400/50 shadow-[var(--shadow-glow-amber)]"
                : "bg-ink-850 border border-ink-700"
            )}
          >
            {popular && (
              <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-amber-400 text-white text-xs font-semibold">
                Most popular
              </span>
            )}
            <h3 className="font-display text-xl text-ink-50">{plan.planName}</h3>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="font-display text-4xl text-ink-50">₹{plan.planPrice?.toLocaleString("en-IN")}</span>
              <span className="text-ink-400 text-sm">/month</span>
            </div>
            <p className="text-sm text-ink-400 mt-2">
              Up to <span className="text-ink-200 font-medium">{plan.noOfStudent}</span> students
              {plan.bufferStudent ? ` + ${plan.bufferStudent} buffer slots` : ""}
            </p>

            <ul className="space-y-2.5 mt-6 mb-7 flex-1">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-ink-300">
                  <Check size={15} className="text-success mt-0.5 shrink-0" /> {perk}
                </li>
              ))}
            </ul>

            <Link to="/register-library">
              <Button variant={popular ? "primary" : "secondary"} className="w-full">
                Get started
              </Button>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
