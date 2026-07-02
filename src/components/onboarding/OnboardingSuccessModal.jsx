import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, PartyPopper } from "lucide-react";
import Button from "../ui/Button";

/**
 * Usage pattern (same everywhere it's used — Plans, Seats, Payment settings, Self-registration
 * toggle, Add student):
 *
 *   const fresh = await checkStepJustCompleted("PLANS");
 *   if (fresh) setSuccessData({ justCompletedLabel: "Student Plan", next: fresh.recommendedNextStep, allCompleted: fresh.allCompleted });
 *
 * Renders nothing when `data` is null.
 */
export default function OnboardingSuccessModal({ data, onClose }) {
  const navigate = useNavigate();
  if (!data) return null;

  const { justCompletedLabel, next, allCompleted } = data;

  const goNext = () => {
    onClose();
    if (next) navigate(next.actionRoute);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-sm bg-ink-850 border border-ink-600 rounded-2xl shadow-[var(--shadow-soft-lg)] p-7 text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-success-soft text-success flex items-center justify-center mb-4">
            {allCompleted ? <PartyPopper size={22} /> : <CheckCircle2 size={22} />}
          </div>

          {allCompleted ? (
            <>
              <h3 className="font-display text-xl text-ink-50 mb-1">Congratulations! 🎉</h3>
              <p className="text-sm text-ink-300 mb-6">
                Your library is fully set up and ready. Start managing students with confidence.
              </p>
              <Button className="w-full" onClick={onClose}>
                Start Managing Students
              </Button>
            </>
          ) : (
            <>
              <h3 className="font-display text-lg text-ink-50 mb-1">Great!</h3>
              <p className="text-sm text-ink-300 mb-5">
                {justCompletedLabel ? `Your ${justCompletedLabel} has been set up successfully.` : "That step is complete."}
              </p>
              {next && (
                <div className="rounded-xl bg-ink-800 border border-ink-700 p-4 mb-5 text-left">
                  <p className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold mb-1">
                    Next Recommended Step
                  </p>
                  <p className="text-sm text-ink-100 font-medium">{next.title}</p>
                  <p className="text-xs text-ink-400 mt-1">{next.description}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={onClose}>
                  Later
                </Button>
                <Button className="flex-1" onClick={goNext}>
                  Continue <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
