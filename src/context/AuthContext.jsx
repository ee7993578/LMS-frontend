import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "studyhub_token";

// Backend JWT claim "role" comes back as ROLE_STUDENT | ROLE_LIBRARY_ADMIN | ROLE_SUPERADMIN
function decodeUser(token) {
  try {
    const payload = jwtDecode(token);
    const rawRole = payload.role; // e.g. "ROLE_LIBRARY_ADMIN"
    return {
      username: payload.sub,
      role: rawRole,
      roleShort: rawRole?.replace("ROLE_", ""), // STUDENT | LIBRARY_ADMIN | SUPERADMIN
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? decodeUser(t) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyToken = useCallback((jwt) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setUser(decodeUser(jwt));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("studyhub:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("studyhub:unauthorized", handleUnauthorized);
  }, [logout]);

  // Auto logout when token expires
  useEffect(() => {
    if (!user?.exp) return;
    const msLeft = user.exp * 1000 - Date.now();
    if (msLeft <= 0) {
      logout();
      return;
    }
    const t = setTimeout(logout, msLeft);
    return () => clearTimeout(t);
  }, [user, logout]);

  const login = useCallback(
    async ({ username, password }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await authApi.login({ username, password });
        applyToken(data.jwt);
        return decodeUser(data.jwt);
      } catch (err) {
        const msg = err.response?.data?.message || "Login failed. Check your credentials.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [applyToken]
  );

  const signup = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await authApi.signup(payload);
        applyToken(data.jwt);
        return decodeUser(data.jwt);
      } catch (err) {
        const msg = err.response?.data?.message || "Sign up failed. Please try again.";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [applyToken]
  );

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, loading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
