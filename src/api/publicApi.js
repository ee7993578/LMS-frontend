import api from "./axios";

// Backend: PublicController -> /api/public  (no auth required)

export const getPublicPlans = () => api.get("/api/public/plan");

// LibraryDTO: { name, address, email, phone, website, status, adminUsername,
//               adminPassword, adminFullName, adminPhone, libraryPlanId }
export const registerLibrary = (payload) => api.post("/api/public/create", payload);
