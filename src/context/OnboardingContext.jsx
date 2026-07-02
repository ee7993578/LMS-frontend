import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getOnboardingStatus, markOnboardingWelcomeSeen } from "../api/onboardingApi";

const OnboardingContext = createContext(null);

/**
 * Wraps the app (library-admin only, no-ops for other roles) and keeps a single shared copy of
 * the onboarding checklist status. This is intentionally derived data — refetched from the
 * server, never locally faked — so the welcome modal, the dashboard checklist card, and the
 * per-page "nice, next step is X" success prompts are always in sync with each other.
 */
export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.roleShort === "LIBRARY_ADMIN";

  const refresh = useCallback(() => {
    if (!isAdmin) {
      setLoading(false);
      return Promise.resolve(null);
    }
    return getOnboardingStatus()
      .then(({ data }) => {
        setStatus(data);
        return data;
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismissWelcome = useCallback(() => {
    setStatus((s) => (s ? { ...s, welcomeShown: true } : s));
    markOnboardingWelcomeSeen().catch(() => {});
  }, []);

  /**
   * Call this right after a page successfully completes an action that might satisfy an
   * onboarding step (e.g. created the library's first plan). It re-fetches status and, if
   * `stepKey` flipped from incomplete -> complete, returns the FRESH status object so the
   * caller can show a "nice, here's what's next" success prompt. Returns null otherwise
   * (e.g. the step was already done, or onboarding wasn't active for this user).
   */
  const checkStepJustCompleted = useCallback(
    async (stepKey) => {
      if (!isAdmin) return null;
      const before = status?.steps?.find((s) => s.key === stepKey);
      if (before?.completed) return null; // already done — no reason to re-notify
      const fresh = await refresh();
      const after = fresh?.steps?.find((s) => s.key === stepKey);
      if (after?.completed) return fresh;
      return null;
    },
    [status, refresh, isAdmin]
  );

  return (
    <OnboardingContext.Provider value={{ status, loading, refresh, dismissWelcome, checkStepJustCompleted, isAdmin }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
