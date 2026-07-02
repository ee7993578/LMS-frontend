import api from "./axios";

// Backend: OnboardingController -> /api/libraryadmin/onboarding
// OnboardingStatusDTO: { welcomeShown, steps:[{key,title,description,estimatedTime,
//   actionLabel, actionRoute, completed}], completedCount, totalCount, percentage,
//   allCompleted, recommendedNextStep }

export const getOnboardingStatus = () => api.get("/api/libraryadmin/onboarding/status");
export const markOnboardingWelcomeSeen = () => api.put("/api/libraryadmin/onboarding/welcome-seen");
