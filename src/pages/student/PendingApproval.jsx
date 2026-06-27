import { useEffect, useState } from "react";
import { Clock, LogOut, RefreshCw, CheckCircle2, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../api/studentApi";

export default function PendingApproval() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    getMyProfile().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const checkStatus = () => {
    setChecking(true);
    getMyProfile()
      .then(r => {
        setProfile(r.data);
        if (r.data?.registrationStatus === "APPROVED" || r.data?.active) {
          window.location.reload(); // refresh to load dashboard
        }
      })
      .finally(() => setChecking(false));
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Animated clock */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-amber-400/10 rounded-full border-2 border-amber-400/20 animate-pulse"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock size={40} className="text-amber-400"/>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold text-ink-50">Registration Pending</h1>
          <p className="text-ink-400 text-sm mt-2">
            Your registration at <span className="text-amber-300 font-medium">
            {profile?.libraryName || "the library"}</span> is under review.
          </p>
        </div>

        <div className="bg-ink-900 border border-ink-700 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} className="text-green-400"/>
            </div>
            <span className="text-ink-300">Registration submitted successfully</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Clock size={14} className="text-amber-400"/>
            </div>
            <span className="text-ink-300">Waiting for admin approval</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-ink-500"/>
            </div>
            <span className="text-ink-500">Dashboard access (after approval)</span>
          </div>
        </div>

        <p className="text-xs text-ink-500">
          You'll receive a notification once your registration is approved. Average approval time is within 24 hours.
        </p>

        <div className="flex gap-2">
          <button onClick={checkStatus} disabled={checking}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={checking ? "animate-spin" : ""}/>
            {checking ? "Checking..." : "Check Status"}
          </button>
          <button onClick={logout}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ink-800 hover:bg-ink-700 text-ink-400 hover:text-ink-200 rounded-xl text-sm transition-colors">
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
