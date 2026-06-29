import axios from "axios";

export const BASE_URL = "https://lms-backend-ztjf.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error codes from LibraryAccessFilter (backend) that represent a SOFT block — the request
// was correctly rejected (e.g. trying to write while read-only), but the session itself is
// still valid. These should surface a toast/banner, not force a logout.
const SOFT_BLOCK_CODES = new Set([
  "TRIAL_EXPIRED_READ_ONLY",
  "SUBSCRIPTION_EXPIRED_READ_ONLY",
]);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (status === 401) {
      // Token missing/invalid/expired — always a real session problem.
      window.dispatchEvent(new CustomEvent("studyhub:unauthorized"));
    } else if (status === 403 && !SOFT_BLOCK_CODES.has(errorCode)) {
      // 403 that isn't one of our known soft-block codes (e.g. LIBRARY_INACTIVE,
      // LIBRARY_DELETED, a plain role mismatch) — treat as a session/access problem.
      window.dispatchEvent(new CustomEvent("studyhub:unauthorized"));
    }
    // Soft-block 403s are left for the calling code to handle (toast the message),
    // session stays intact.
    return Promise.reject(error);
  }
);

export default api;
