import axios from "axios";

export const BASE_URL = "http://localhost:8080";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Let the calling code decide what to show; just flag session issues.
      window.dispatchEvent(new CustomEvent("studyhub:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
