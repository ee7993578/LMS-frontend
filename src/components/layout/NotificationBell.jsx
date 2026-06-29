import { useState, useEffect, useRef } from "react";
import { Bell, Check, Archive, BellOff, Loader2 } from "lucide-react";
import { getMyNotifications, getUnreadCount, markRead, markAllRead, archiveNotification } from "../../api/notificationApi";
import { formatDate } from "../../utils/format";

const TYPE_COLOR = {
  PAYMENT_APPROVED: "bg-green-500",
  PAYMENT_REJECTED: "bg-red-500",
  PAYMENT_SUBMITTED: "bg-blue-500",
  FEE_DUE: "bg-yellow-500",
  FEE_OVERDUE: "bg-red-600",
  ANNOUNCEMENT: "bg-purple-500",
  SYSTEM: "bg-gray-500",
  default: "bg-amber-500",
};

export default function NotificationBell() {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const loadCount = () => getUnreadCount().then(r => setCount(r.data?.count || 0)).catch(() => {});
  const loadAll   = () => { setLoading(true); getMyNotifications().then(r => setNotifs(r.data || [])).finally(() => setLoading(false)); };

  useEffect(() => {
    loadCount();
    // Only poll when tab is visible — saves backend calls on background tabs
    let t = setInterval(loadCount, 60000); // reduced to 60s
    const onVisibility = () => {
      if (document.hidden) { clearInterval(t); }
      else { loadCount(); t = setInterval(loadCount, 60000); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!open) return;
    loadAll();
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
    setCount(c => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs(prev => prev.map(n => ({...n, isRead: true})));
    setCount(0);
  };

  const handleArchive = async (id) => {
    await archiveNotification(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const dot = (type) => TYPE_COLOR[type] || TYPE_COLOR.default;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-ink-700 transition-colors text-ink-300 hover:text-ink-100">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700">
            <h3 className="font-semibold text-ink-100 text-sm">Notifications</h3>
            {count > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <Check size={12}/> Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-ink-500"/>
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-ink-500">
                <BellOff size={28} className="mb-2"/>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div key={n.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-ink-800 transition-colors border-b border-ink-800/50 ${!n.isRead ? "bg-ink-800/40" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dot(n.type)}`}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${!n.isRead ? "text-ink-100" : "text-ink-300"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-ink-600 mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)}
                        className="p-1 rounded hover:bg-ink-700 text-ink-500 hover:text-green-400" title="Mark read">
                        <Check size={12}/>
                      </button>
                    )}
                    <button onClick={() => handleArchive(n.id)}
                      className="p-1 rounded hover:bg-ink-700 text-ink-500 hover:text-ink-300" title="Archive">
                      <Archive size={12}/>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
