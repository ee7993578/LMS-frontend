import axios from "axios";

// In development: Vite proxy handles /api → backend (no CORS)
// In production: set VITE_API_URL to your backend domain
export const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s timeout — prevents hanging requests
});

// ── Request interceptor — attach token ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyhub_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — handle 401/403 globally ────────────────────────
const SOFT_BLOCK_CODES = new Set([
  "TRIAL_EXPIRED_READ_ONLY",
  "SUBSCRIPTION_EXPIRED_READ_ONLY",
]);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status    = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401) {
      window.dispatchEvent(new CustomEvent("studyhub:unauthorized"));
    } else if (status === 403 && !SOFT_BLOCK_CODES.has(errorCode)) {
      window.dispatchEvent(new CustomEvent("studyhub:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
