import api from "./axios";
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://lms-backend-ztjf.onrender.com";

// PUBLIC (no auth)
export const validateLibraryCode = (code) =>
  axios.get(`${BASE}/api/public/register/validate/${code}`);

export const submitStudentRegistration = (formData) =>
  axios.post(`${BASE}/api/public/register/student`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ADMIN
export const getPendingRegistrations = () =>
  api.get("/api/libraryadmin/registrations/pending");

export const approveStudent = (studentId, body) =>
  api.post(`/api/libraryadmin/registrations/${studentId}/approve`, body);

export const rejectStudent = (studentId, reason) =>
  api.post(`/api/libraryadmin/registrations/${studentId}/reject`, { reason });

export const getRegistrationSettings = () =>
  api.get("/api/libraryadmin/registrations/settings");

export const updateRegistrationSettings = (body) =>
  api.put("/api/libraryadmin/registrations/settings", body);
