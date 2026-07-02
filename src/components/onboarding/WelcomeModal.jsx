import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Clock3, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import { useOnboarding } from "../../context/OnboardingContext";
import { useAuth } from "../../context/AuthContext";

/**
 * Shows exactly once — driven by Library.onboardingWelcomeShown on the backend, not local
 * storage, so it stays correct across devices/browsers. Purely additive: dashboard renders
 * completely normally underneath it.
 */
export default function WelcomeModal({ libraryName }) {
  const { status, dismissWelcome, isAdmin } = useOnboarding();
  const { user } = useAuth();

  if (!isAdmin || !status || status.welcomeShown) return null;

  const firstName = user?.username || "there";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
          className="relative w-full max-w-md bg-ink-850 border border-ink-600 rounded-3xl shadow-[var(--shadow-soft-lg)] p-8 text-center overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-[var(--shadow-glow-amber)] flex items-center justify-center mb-5">
              <PartyPopper size={28} className="text-white" />
            </div>

            <h2 className="font-display text-2xl text-ink-50 mb-1">
              Welcome to StudyHub{libraryName ? `, ${libraryName}` : ""}
            </h2>
            <p className="text-xs text-ink-500 mb-3">Signed in as {firstName}</p>
            <p className="text-sm text-amber-300 font-medium mb-4">
              Congratulations! Your library has been created successfully.
            </p>
            <p className="text-sm text-ink-300 leading-relaxed mb-6">
              Let's get everything set up — plans, seats, payments and your first student.
              We'll guide you through every step, one at a time.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-ink-400 mb-7">
              <Clock3 size={14} className="text-amber-400" />
              <span>Estimated time: <span className="text-ink-100 font-medium">10–15 minutes</span></span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-ink-400 mb-1.5">
                <span>Progress</span>
                <span className="text-ink-100 font-medium">0%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-ink-800 overflow-hidden">
                <div className="h-full w-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
              </div>
            </div>

            <Button className="w-full" onClick={dismissWelcome}>
              Start Setup <ArrowRight size={16} />
            </Button>
            <button
              onClick={dismissWelcome}
              className="mt-3 text-xs text-ink-500 hover:text-ink-300 transition-colors"
            >
              I'll explore on my own
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
