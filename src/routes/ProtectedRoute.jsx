import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProfile } from "../api/studentApi";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [profileStatus, setProfileStatus] = useState(null); // null=loading, "ok", "pending"

  // For STUDENT role: check if registration is still pending
  useEffect(() => {
    if (!isAuthenticated || user?.roleShort !== "STUDENT") {
      setProfileStatus("ok");
      return;
    }
    // Don't re-check if already on pending page
    if (location.pathname === "/student/pending-approval") {
      setProfileStatus("ok");
      return;
    }
    getMyProfile()
      .then(r => {
        const data = r.data;
        if (data?.registrationStatus === "PENDING_APPROVAL" || data?.active === false) {
          setProfileStatus("pending");
        } else {
          setProfileStatus("ok");
        }
      })
      .catch(() => setProfileStatus("ok")); // on error let through
  }, [isAuthenticated, user, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.roleShort)) {
    return <Navigate to="/session-expired" replace />;
  }

  // Student pending check
  if (user?.roleShort === "STUDENT" && location.pathname !== "/student/pending-approval") {
    if (profileStatus === null) return null; // loading
    if (profileStatus === "pending") {
      return <Navigate to="/student/pending-approval" replace />;
    }
  }

  return <Outlet />;
}
