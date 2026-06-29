import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QrCode, CheckCircle2, UserPlus, Loader2, Building2, LogIn } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { punchWithQR } from "../../api/attendanceApi";

export default function QrScanLanding() {
  const { qrValue } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState("resolving"); // resolving | punching | done | error | register
  const [message, setMessage] = useState("");
  const [libraryInfo, setLibraryInfo] = useState(null);
  const [punchResult, setPunchResult] = useState(null);

  useEffect(() => {
    if (!qrValue) { setStatus("error"); setMessage("Invalid QR code"); return; }
    resolve();
  }, [qrValue]);

  const resolve = async () => {
    setStatus("resolving");
    try {
      // 1. Resolve QR → get library info
      const { data } = await api.get(`/api/public/qr/resolve/${qrValue}`);
      setLibraryInfo(data);

      // 2. Decide action based on auth state
      if (isAuthenticated && user?.roleShort === "STUDENT") {
        // Student is logged in → punch attendance
        setStatus("punching");
        try {
          const punchRes = await punchWithQR(qrValue);
          setPunchResult(punchRes.data);
          setStatus("done");
        } catch (punchErr) {
          setStatus("error");
          setMessage(punchErr?.response?.data?.message || "Punch failed. Please try again.");
        }
      } else if (!isAuthenticated) {
        // Not logged in → show options (register or login)
        setStatus("register");
      } else {
        // Logged in but not a student (admin etc.)
        setStatus("error");
        setMessage("This QR code is for student attendance or registration only.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Invalid or expired QR code.");
    }
  };

  const goToRegister = () => {
    if (libraryInfo?.libraryCode) {
      navigate(`/register/${libraryInfo.libraryCode}`);
    } else {
      navigate("/register/student");
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* ── Resolving ── */}
        {status === "resolving" && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-amber-400/10 rounded-full flex items-center justify-center border border-amber-400/20">
              <Loader2 size={36} className="text-amber-400 animate-spin" />
            </div>
            <p className="text-ink-300 text-sm">Reading QR code...</p>
          </div>
        )}

        {/* ── Punching attendance ── */}
        {status === "punching" && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 animate-pulse">
              <QrCode size={36} className="text-indigo-400" />
            </div>
            <p className="text-ink-300 text-sm">Recording attendance...</p>
            {libraryInfo?.libraryName && (
              <p className="text-xs text-ink-500">{libraryInfo.libraryName}</p>
            )}
          </div>
        )}

        {/* ── Done (attendance punched) ── */}
        {status === "done" && punchResult && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-6 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 ${
              punchResult.attendanceStatus === "IN"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}>
              <CheckCircle2 size={36} className={punchResult.attendanceStatus === "IN" ? "text-green-400" : "text-blue-400"} />
            </div>

            <div>
              <h2 className="text-xl font-display font-bold text-ink-50">
                {punchResult.attendanceStatus === "IN" ? "Punched In! 🎉" : "Punched Out! 👋"}
              </h2>
              {libraryInfo?.libraryName && (
                <p className="text-xs text-ink-500 mt-1">{libraryInfo.libraryName}</p>
              )}
            </div>

            {punchResult.attendanceStatus === "OUT" && punchResult.totalStudyMinutes > 0 && (
              <div className="bg-ink-800 rounded-xl p-3">
                <p className="text-xs text-ink-500">Study time today</p>
                <p className="text-2xl font-display font-bold text-indigo-300 mt-1">
                  {Math.floor(punchResult.totalStudyMinutes / 60)}h {punchResult.totalStudyMinutes % 60}m
                </p>
              </div>
            )}

            <button
              onClick={() => navigate("/student")}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold rounded-xl text-sm transition-colors">
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Register options (not logged in) ── */}
        {status === "register" && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-6 space-y-4">
            {libraryInfo?.libraryName && (
              <div className="flex items-center gap-3 bg-ink-800 rounded-xl p-3">
                <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-ink-100 text-sm">{libraryInfo.libraryName}</p>
                  <p className="text-xs text-ink-500">Scanned QR Code</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <h2 className="text-lg font-display font-bold text-ink-50">What would you like to do?</h2>
              <p className="text-xs text-ink-500 mt-1">Choose an option to continue</p>
            </div>

            <div className="space-y-2">
              {/* Register as new student */}
              {libraryInfo?.registrationEnabled && (
                <button onClick={goToRegister}
                  className="w-full flex items-center gap-3 p-4 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition-colors text-left">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserPlus size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300 text-sm">New Student? Register Here</p>
                    <p className="text-xs text-ink-500 mt-0.5">Library code is pre-filled automatically</p>
                  </div>
                </button>
              )}

              {/* Already have account → login */}
              <button onClick={() => navigate("/login", { state: { redirectAfterLogin: `/qr/${qrValue}` } })}
                className="w-full flex items-center gap-3 p-4 bg-ink-800 hover:bg-ink-700 border border-ink-600 rounded-xl transition-colors text-left">
                <div className="w-10 h-10 bg-ink-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LogIn size={20} className="text-ink-400" />
                </div>
                <div>
                  <p className="font-semibold text-ink-200 text-sm">Already a Member? Login</p>
                  <p className="text-xs text-ink-500 mt-0.5">Login to mark your attendance</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="bg-ink-900 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <QrCode size={28} className="text-red-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-ink-100">QR Code Error</h2>
              <p className="text-sm text-red-400 mt-1">{message}</p>
            </div>
            <button onClick={() => navigate("/")}
              className="w-full py-2.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-xl text-sm transition-colors">
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
