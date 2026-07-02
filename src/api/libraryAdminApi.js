import api from "./axios";

// Backend: LibraryAdminController -> /api/libraryadmin (hasRole LIBRARY_ADMIN)

// ---- Students ----
// StudentDTO: { id, fullName, email, phone, seat, plan, planId, seatId, username, password }
export const createStudent = (payload) => api.post("/api/libraryadmin/student", payload);
export const updateStudent = (id, payload) => api.put(`/api/libraryadmin/student/${id}`, payload);
export const deleteStudent = (id) => api.delete(`/api/libraryadmin/student/${id}`);
export const getAllStudents = () => api.get("/api/libraryadmin/students");

// ---- Student subscription (plan cycle) change/history ----
// StudentSubscriptionDTO: { id, studentId, planId, planName, cycleStart, cycleEnd,
//   planDurationDays, planPrice, payable, paid, balance, carryForwardCredit, status,
//   displayStatus, changeType, previousSubscriptionId, daysRemaining, createdAt, createdBy }
export const changeStudentSubscription = (studentId, newPlanId, mode) =>
  api.post(`/api/libraryadmin/student/${studentId}/subscription/change`, { newPlanId, mode });
export const getStudentSubscriptionHistory = (studentId) =>
  api.get(`/api/libraryadmin/student/${studentId}/subscription/history`);

// ---- Subscription / trial / plan-usage status (drives banners + grace dashboard) ----
// LibraryUsageDTO: { libraryId, libraryName, planName, planLimit, graceLimit, currentStudentCount,
//                     inGracePeriod, graceDaysRemaining, graceExceeded, status, daysRemainingInCurrentPhase }
export const getMySubscriptionStatus = () => api.get("/api/libraryadmin/subscription-status");

// ---- Plan upgrade requests (library admin -> SuperAdmin approval flow) ----
// All active SaaS plans the admin can pick from to request a switch:
export const getPlanCatalog = () => api.get("/api/libraryadmin/plan/catalog");
// PlanUpgradeRequestDTO: { id, libraryId, libraryName, currentPlanId, currentPlanName,
//                           requestedPlanId, requestedPlanName, requestedPlanPrice,
//                           requestedPlanStudents, note, status, resolutionNote, createdAt, resolvedAt }
export const requestPlanChange = (requestedPlanId, note) =>
  api.post("/api/libraryadmin/plan-requests", { requestedPlanId, note });
export const getMyPlanRequests = () => api.get("/api/libraryadmin/plan-requests");

// ---- Plan upgrade payment (Razorpay) ----
// If requestedPlan is free, behaves like requestPlanChange above (still goes to SuperAdmin) and
// returns { requiresPayment: false, result: <PlanUpgradeRequestDTO> }.
// If requestedPlan is paid, returns
// { requiresPayment: true, razorpayOrderId, keyId, amountPaise, currency, paymentRecordId, planName, result }
// — the plan switch is only applied once /plan-requests/verify confirms payment (no SuperAdmin wait).
export const initiatePlanUpgrade = (requestedPlanId, note) =>
  api.post("/api/libraryadmin/plan-requests/initiate", { requestedPlanId, note });

export const verifyPlanUpgrade = ({ paymentRecordId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) =>
  api.post("/api/libraryadmin/plan-requests/verify", { paymentRecordId, razorpayOrderId, razorpayPaymentId, razorpaySignature });

export const cancelPlanUpgrade = (paymentRecordId) =>
  api.post("/api/libraryadmin/plan-requests/cancel", { paymentRecordId });

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
export const getSubscriptionExpiryReport = () => api.get("/api/libraryadmin/fee/subscription-report");

// ---- QR (for attendance punch) ----
export const generateLibraryQR = () => api.get("/api/libraryadmin/generate");
export const getLibraryQR = () => api.get("/api/libraryadmin/getQR");
