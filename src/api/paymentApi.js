import api from "./axios";

// Backend: LibraryAdminController + StudentController -> /api/libraryadmin, /api/student

// ---- Payment Settings (admin's deposit QR/UPI/phone/description) ----
// PaymentSettingsDTO: { id, libraryId, qrImageUrl, upiId, phoneNumber, description, updatedAt }

export const getAdminPaymentSettings = () => api.get("/api/libraryadmin/payment-settings");

export const saveAdminPaymentSettings = ({ qrFile, upiId, phoneNumber, description }) => {
  const formData = new FormData();
  if (qrFile) formData.append("qrFile", qrFile);
  if (upiId !== undefined) formData.append("upiId", upiId || "");
  if (phoneNumber !== undefined) formData.append("phoneNumber", phoneNumber || "");
  if (description !== undefined) formData.append("description", description || "");
  return api.post("/api/libraryadmin/payment-settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getStudentPaymentSettings = () => api.get("/api/student/payment-settings");

// ---- Payment Proofs ----
// PaymentProofDTO: { id, studentId, studentName, libraryId, screenshotUrl, description,
//                    amountClaimed, status, submittedAt, verifiedAt, adminNote }

export const submitPaymentProof = ({ screenshot, description, amountClaimed }) => {
  const formData = new FormData();
  if (screenshot) formData.append("screenshot", screenshot);
  if (description !== undefined) formData.append("description", description || "");
  if (amountClaimed !== undefined && amountClaimed !== "" && amountClaimed !== null) {
    formData.append("amountClaimed", amountClaimed);
  }
  return api.post("/api/student/payment-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getMyPaymentProofs = () => api.get("/api/student/payment-proofs");

export const getLibraryPaymentProofs = () => api.get("/api/libraryadmin/payment-proofs");
export const getPendingPaymentProofs = () => api.get("/api/libraryadmin/payment-proofs/pending");

// feeDTO: { Receive, concession, lateFee, feeStatus, payable, dueDate, ... } — same shape as updateStudentFee
export const verifyPaymentProof = (proofId, feeDTO) =>
  api.put(`/api/libraryadmin/payment-proofs/${proofId}/verify`, feeDTO);

export const rejectPaymentProof = (proofId, adminNote) =>
  api.put(`/api/libraryadmin/payment-proofs/${proofId}/reject`, { adminNote });
