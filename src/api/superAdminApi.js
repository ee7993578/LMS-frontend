import api from "./axios";

// Backend: SuperAdminLibraryController -> /api/superadmin/library (hasRole SUPERADMIN)
export const createLibrary = (payload) => api.post("/api/superadmin/library/create", payload);
export const updateLibrary = (id, payload) => api.put(`/api/superadmin/library/update/${id}`, payload);
export const deleteLibrary = (id) => api.delete(`/api/superadmin/library/delete/${id}`); // soft-delete (sets status DELETED, no data removed)
export const getAllLibraries = () => api.get("/api/superadmin/library");
export const getLibraryById = (libraryId) => api.get(`/api/superadmin/library/${libraryId}`);
export const getLibrariesByStatus = (status) => api.get(`/api/superadmin/library/status/${status}`);
export const changeLibraryStatus = (id, status) =>
  api.put(`/api/superadmin/library/update/status/${id}`, null, { params: { status } });
export const assignPlanToLibrary = (libraryId, planId) =>
  api.put(`/api/superadmin/library/${libraryId}/plan/${planId}`);

// ===== Lifecycle actions =====
export const activateLibrary = (libraryId) => api.put(`/api/superadmin/library/${libraryId}/activate`);
export const suspendLibrary = (libraryId) => api.put(`/api/superadmin/library/${libraryId}/suspend`);
export const restoreLibrary = (libraryId) => api.put(`/api/superadmin/library/${libraryId}/restore`);
export const renewLibrarySubscription = (libraryId, days) =>
  api.put(`/api/superadmin/library/${libraryId}/renew`, null, { params: days ? { days } : {} });
export const upgradeLibraryPlan = (libraryId, newPlanId) =>
  api.put(`/api/superadmin/library/${libraryId}/upgrade/${newPlanId}`);
export const downgradeLibraryPlan = (libraryId, newPlanId) =>
  api.put(`/api/superadmin/library/${libraryId}/downgrade/${newPlanId}`);

// ===== Usage =====
export const getLibraryUsage = (libraryId) => api.get(`/api/superadmin/library/${libraryId}/usage`);
export const getAllLibraryUsage = () => api.get("/api/superadmin/usage");

// ===== Dashboard =====
export const getSuperAdminDashboard = () => api.get("/api/superadmin/dashboard");

// ===== Plan upgrade requests from library admins =====
// PlanUpgradeRequestDTO: { id, libraryId, libraryName, currentPlanId, currentPlanName,
//                           requestedPlanId, requestedPlanName, requestedPlanPrice,
//                           requestedPlanStudents, note, status, resolutionNote, createdAt, resolvedAt }
export const getAllPlanRequests = (status) =>
  api.get("/api/superadmin/plan-requests", { params: status ? { status } : {} });
export const approvePlanRequest = (id, resolutionNote) =>
  api.put(`/api/superadmin/plan-requests/${id}/approve`, { resolutionNote });
export const rejectPlanRequest = (id, resolutionNote) =>
  api.put(`/api/superadmin/plan-requests/${id}/reject`, { resolutionNote });

// Backend: SuperAdminPlanController -> /api/superadmin/plan (hasRole SUPERADMIN)
// LibraryPlanDTO: { planId, planName, planPrice, noOfStudent, bufferStudent, planOrder, noOfDays,
//                    description, isActive, gracePeriodDays }
export const createLibraryPlan = (payload) => api.post("/api/superadmin/plan", payload);
export const updateLibraryPlan = (id, payload) => api.put(`/api/superadmin/plan/${id}`, payload);
export const getLibraryPlanById = (id) => api.get(`/api/superadmin/plan/${id}`);
export const deleteLibraryPlan = (id) => api.delete(`/api/superadmin/plan/${id}`); // soft-deactivates if in use
export const getAllLibraryPlans = () => api.get("/api/superadmin/plan");
export const getActiveLibraryPlans = () => api.get("/api/superadmin/plan/active");
export const activateLibraryPlan = (id) => api.put(`/api/superadmin/plan/${id}/activate`);
export const deactivateLibraryPlan = (id) => api.put(`/api/superadmin/plan/${id}/deactivate`);
