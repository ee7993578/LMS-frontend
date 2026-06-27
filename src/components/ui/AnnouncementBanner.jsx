import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { getMyAnnouncements } from "../../api/announcementApi";

const TYPE_BG = {
  SYSTEM_UPDATE: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  MAINTENANCE:   "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
  OFFER:         "bg-green-500/10 border-green-500/30 text-green-300",
  SUBSCRIPTION_ALERT: "bg-red-500/10 border-red-500/30 text-red-300",
  GENERAL:       "bg-amber-500/10 border-amber-500/30 text-amber-300",
};

export default function AnnouncementBanner({ role }) {
  const [items, setItems]       = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const fetcher = role === "STUDENT"
      ? () => import("../../api/announcementApi").then(m => m.getStudentAnnouncements())
      : () => import("../../api/announcementApi").then(m => m.getMyAnnouncements());
    fetcher().then(r => setItems(r.data || [])).catch(() => {});
  }, [role]);

  const visible = items.filter(a => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visible.slice(0, 3).map(a => (
        <div key={a.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${TYPE_BG[a.type] || TYPE_BG.GENERAL}`}>
          <Megaphone size={16} className="flex-shrink-0 mt-0.5"/>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{a.title}</p>
            <p className="opacity-80 mt-0.5 text-xs">{a.content}</p>
          </div>
          <button onClick={() => setDismissed(p => new Set([...p, a.id]))} className="opacity-60 hover:opacity-100">
            <X size={14}/>
          </button>
        </div>
      ))}
    </div>
  );
}
