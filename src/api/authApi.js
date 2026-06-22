import api from "./axios";

// Backend: AuthController -> /api/auth
// signup/login both take UserDto: { fullName, username, password, role, phone }
// role enum values: ROLE_STUDENT | ROLE_LIBRARY_ADMIN | ROLE_SUPERADMIN
// Response (AuthResponse): { jwt, message }

export const signup = (payload) => api.post("/api/auth/signup", payload);
export const login = (payload) => api.post("/api/auth/login", payload);
