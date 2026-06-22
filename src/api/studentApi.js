import api from "./axios";

// Backend: StudentController -> /api/student (hasRole STUDENT)

export const getMySeat = () => api.get("/api/student/my-seat");

export const getMyFees = () => api.get("/api/student/my-fees");

export const getMyProfile = () => api.get("/api/student/my-profile");

export const getLeaderboard = (period = "month") =>
  api.get("/api/student/leaderboard", { params: { period } });
