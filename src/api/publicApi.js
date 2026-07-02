import api from "./axios";

// Backend: PublicController -> /api/public  (no auth required)

export const getPublicPlans = () => api.get("/api/public/plan");

// LibraryDTO: { name, address, email, phone, website, status, adminUsername,
//               adminPassword, adminFullName, adminPhone, libraryPlanId }
export const registerLibrary = (payload) => api.post("/api/public/create", payload);

// ---- Paid-plan signup (Razorpay) ----
// If the chosen plan is free (order 1 / starter), the backend creates the library right away
// and returns { requiresPayment: false, result: <LibraryDTO> } — no checkout needed.
// If a paid plan is chosen, nothing is created yet — it returns
// { requiresPayment: true, razorpayOrderId, keyId, amountPaise, currency, paymentRecordId, planName }.
export const initiateLibrarySignup = (payload) => api.post("/api/public/create/initiate", payload);

// After Razorpay Checkout succeeds, call this with the checkout response to actually create
// the library. Returns the created LibraryDTO.
export const verifyLibrarySignup = ({ paymentRecordId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) =>
  api.post("/api/public/create/verify", { paymentRecordId, razorpayOrderId, razorpayPaymentId, razorpaySignature });

// Call if the user closes the Razorpay popup without paying, so the staged signup doesn't
// linger as an orphaned "CREATED" payment row.
export const cancelLibrarySignup = (paymentRecordId) =>
  api.post("/api/public/create/cancel", { paymentRecordId });
