import api from "./axios";

// Backend: StudentController -> /api/student (hasRole STUDENT)

export const getMySeat = () => api.get("/api/student/my-seat");

export const getMyFees = () => api.get("/api/student/my-fees");

export const getMyProfile = () => api.get("/api/student/my-profile");

export const getLeaderboard = (period = "month") =>
  api.get("/api/student/leaderboard", { params: { period } });

// { status, daysRemainingInCurrentPhase } — drives the trial/expired status banner
export const getLibraryStatus = () => api.get("/api/student/library-status");

// { planName, cycleStart, cycleEnd, daysRemaining, status, payable, paid, balance }
// Drives the "My Plan" card + plan expiry banner on the student dashboard.
export const getMySubscription = () => api.get("/api/student/my-subscription");
