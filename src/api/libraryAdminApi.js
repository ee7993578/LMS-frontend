import api from "./axios";

// Backend: LibraryAdminController -> /api/libraryadmin (hasRole LIBRARY_ADMIN)

// ---- Students ----
// StudentDTO: { id, fullName, email, phone, seat, plan, planId, seatId, username, password }
export const createStudent = (payload) => api.post("/api/libraryadmin/student", payload);
export const updateStudent = (id, payload) => api.put(`/api/libraryadmin/student/${id}`, payload);
export const deleteStudent = (id) => api.delete(`/api/libraryadmin/student/${id}`);
export const getAllStudents = () => api.get("/api/libraryadmin/students");

// ---- Plans (per-library hourly/monthly/custom plans) ----
// PlanDTO: { id, name, duration, price, library, libraryId }
export const createPlan = (payload) => api.post("/api/libraryadmin/plan", payload);
export const getPlanById = (id) => api.get(`/api/libraryadmin/plan/${id}`);
export const updatePlan = (id, payload) => api.put(`/api/libraryadmin/plan/${id}`, payload);
export const deletePlan = (id) => api.delete(`/api/libraryadmin/plan/${id}`);
export const getAllPlans = () => api.get("/api/libraryadmin/plan");

// ---- Fees ----
// FeeDTO: { feeId, libraryId, studentId, monthId, dueDate, paymentDate, payable, Receive, balance, concession, lateFee, feeStatus }
export const updateStudentFee = (studentId, payload) =>
  api.put(`/api/libraryadmin/fee/${studentId}`, payload);
export const getLibraryFees = () => api.get("/api/libraryadmin/fee");
export const getLibraryFeesByMonth = (monthId) => api.get(`/api/libraryadmin/fee/${monthId}`);

// ---- QR (for attendance punch) ----
export const generateLibraryQR = () => api.get("/api/libraryadmin/generate");
export const getLibraryQR = () => api.get("/api/libraryadmin/getQR");
