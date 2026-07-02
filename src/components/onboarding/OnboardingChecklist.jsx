import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ArrowRight, Sparkles, Clock3 } from "lucide-react";
import Card, { CardBody } from "../ui/Card";
import Button from "../ui/Button";
import { useOnboarding } from "../../context/OnboardingContext";

function StepRow({ step, expanded, onToggle, onAction }) {
  return (
    <div className="rounded-xl border border-ink-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-ink-800/60 transition-colors"
      >
        {step.completed ? (
          <CheckCircle2 size={18} className="text-success shrink-0" />
        ) : (
          <Circle size={18} className="text-ink-500 shrink-0" />
        )}
        <span className={`flex-1 text-sm font-medium ${step.completed ? "text-ink-400 line-through" : "text-ink-100"}`}>
          {step.title}
        </span>
        {!step.completed && (
          <span className="text-[11px] text-ink-500 hidden sm:flex items-center gap-1">
            <Clock3 size={11} /> {step.estimatedTime}
          </span>
        )}
        <ChevronDown size={15} className={`text-ink-500 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-ink-800">
              <p className="text-sm text-ink-400 leading-relaxed mb-3">{step.description}</p>
              {!step.completed && (
                <Button size="sm" variant="secondary" onClick={onAction}>
                  {step.actionLabel} <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingChecklist() {
  const { status, loading, isAdmin } = useOnboarding();
  const [expandedKey, setExpandedKey] = useState(null);
  const navigate = useNavigate();

  if (!isAdmin || loading || !status) return null;
  // Auto-hides once fully complete — this card only exists to guide a first-time setup.
  if (status.allCompleted) return null;

  const { steps, percentage, recommendedNextStep } = status;

  return (
    <Card className="mb-6 border-amber-400/20 bg-gradient-to-br from-ink-850 to-ink-900">
      <CardBody>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="font-display text-lg text-ink-50">Library Setup</h3>
            </div>
            <p className="text-xs text-ink-400">A few quick steps to get your library fully ready.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-display text-amber-400">{percentage}%</p>
            <p className="text-[11px] text-ink-500">complete</p>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-ink-800 overflow-hidden mb-5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-400">
            <CheckCircle2 size={18} className="text-success shrink-0" />
            <span className="line-through">Library Created</span>
          </div>
          {steps.map((step) => (
            <StepRow
              key={step.key}
              step={step}
              expanded={expandedKey === step.key}
              onToggle={() => setExpandedKey((k) => (k === step.key ? null : step.key))}
              onAction={() => navigate(step.actionRoute)}
            />
          ))}
        </div>

        {recommendedNextStep && (
          <div className="rounded-xl bg-amber-400/10 border border-amber-400/25 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold mb-0.5">
                Recommended Next Step
              </p>
              <p className="text-sm text-ink-100 font-medium">{recommendedNextStep.title}</p>
              <p className="text-xs text-ink-400 mt-0.5">{recommendedNextStep.description}</p>
            </div>
            <Button size="sm" onClick={() => navigate(recommendedNextStep.actionRoute)}>
              Continue <ArrowRight size={14} />
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
