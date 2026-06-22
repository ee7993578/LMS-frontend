import api from "./axios";

// Backend: SuperAdminLibraryController -> /api/superadmin/library (hasRole SUPERADMIN)
export const createLibrary = (payload) => api.post("/api/superadmin/library/create", payload);
export const updateLibrary = (id, payload) => api.put(`/api/superadmin/library/update/${id}`, payload);
export const deleteLibrary = (id) => api.delete(`/api/superadmin/library/delete/${id}`);
export const getAllLibraries = () => api.get("/api/superadmin/library");
export const getLibraryById = (libraryId) => api.get(`/api/superadmin/library/${libraryId}`);
export const getLibrariesByStatus = (status) => api.get(`/api/superadmin/library/status/${status}`);
export const changeLibraryStatus = (id, status) =>
  api.put(`/api/superadmin/library/update/status/${id}`, null, { params: { status } });
export const assignPlanToLibrary = (libraryId, planId) =>
  api.put(`/api/superadmin/library/${libraryId}/plan/${planId}`);

// Backend: SuperAdminPlanController -> /api/superadmin/plan (hasRole SUPERADMIN, except GET all)
// LibraryPlanDTO: { planId, planName, planPrice, noOfStudent, bufferStudent, planOrder, noOfDays }
export const createLibraryPlan = (payload) => api.post("/api/superadmin/plan", payload);
export const updateLibraryPlan = (id, payload) => api.put(`/api/superadmin/plan/${id}`, payload);
export const getLibraryPlanById = (id) => api.get(`/api/superadmin/plan/${id}`);
export const deleteLibraryPlan = (id) => api.delete(`/api/superadmin/plan/${id}`);
export const getAllLibraryPlans = () => api.get("/api/superadmin/plan");
