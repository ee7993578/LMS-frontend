import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMySubscriptionStatus } from "../../api/libraryAdminApi";
import { getLibraryStatus } from "../../api/studentApi";

/**
 * Shows the trial/grace/expired banners required across every Library Admin and Student
 * page. Polls a lightweight status endpoint on mount and on a slow interval (5 min) so the
 * countdown stays roughly fresh without hammering the API.
 *
 * Banners shown (matches backend LibraryAccessFilter / LibraryLifecycleService 1:1):
 *  - TRIAL_READ_ONLY      -> "Your trial has expired. Subscribe to continue using all features."
 *  - EXPIRED_READ_ONLY    -> "Your subscription has expired. Renew your subscription within 7 days."
 *  - inGracePeriod        -> "You are currently using grace students. Upgrade your plan before grace period ends."
 *  - graceExceeded        -> "You have exceeded your plan limit. Upgrade your subscription within 3 days."
 */
export default function StatusBanner() {
  const { user } = useAuth();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = () => {
      const fetcher = user.roleShort === "STUDENT" ? getLibraryStatus : getMySubscriptionStatus;
      fetcher()
        .then(({ data }) => { if (!cancelled) setInfo(data); })
        .catch(() => { /* silent — banner just won't show if this fails */ });
    };

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  if (!info) return null;

  const banners = [];

  if (info.status === "TRIAL_READ_ONLY") {
    banners.push({
      tone: "warning",
      icon: <AlertTriangle size={16} />,
      message: "Your trial has expired. Subscribe to continue using all features.",
      action: user?.roleShort === "LIBRARY_ADMIN" ? { label: "View plans", to: "/admin/settings" } : null,
    });
  } else if (info.status === "EXPIRED_READ_ONLY") {
    banners.push({
      tone: "warning",
      icon: <AlertTriangle size={16} />,
      message: "Your subscription has expired. Renew your subscription within 7 days.",
      action: user?.roleShort === "LIBRARY_ADMIN" ? { label: "Renew now", to: "/admin/settings" } : null,
    });
  } else if (info.status === "TRIAL" && info.daysRemainingInCurrentPhase != null) {
    banners.push({
      tone: "info",
      icon: <Clock size={16} />,
      message: `You're on a free trial — ${info.daysRemainingInCurrentPhase} day(s) remaining.`,
      action: null,
    });
  }

  // Plan/grace banner is only meaningful for library admins (LibraryUsageDTO fields).
  if (user?.roleShort === "LIBRARY_ADMIN") {
    if (info.graceExceeded) {
      banners.push({
        tone: "danger",
        icon: <AlertTriangle size={16} />,
        message: "You have exceeded your plan limit. Upgrade your subscription within 3 days.",
        action: { label: "Upgrade plan", to: "/admin/settings" },
      });
    } else if (info.inGracePeriod) {
      banners.push({
        tone: "warning",
        icon: <AlertTriangle size={16} />,
        message: "You are currently using grace students. Upgrade your plan before grace period ends.",
        action: { label: "Upgrade plan", to: "/admin/settings" },
      });
    }
  }

  if (banners.length === 0) return null;

  const toneClasses = {
    warning: "bg-warning-soft border-warning/30 text-warning",
    danger: "bg-danger-soft border-danger/30 text-danger",
    info: "bg-info-soft border-info/30 text-info",
  };

  return (
    <div className="space-y-2 mb-4">
      {banners.map((b, i) => (
        <div key={i} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${toneClasses[b.tone]}`}>
          <div className="flex items-center gap-2">
            {b.icon}
            <span className="font-medium">{b.message}</span>
          </div>
          {b.action && (
            <Link to={b.action.to} className="text-xs font-semibold underline whitespace-nowrap">
              {b.action.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
