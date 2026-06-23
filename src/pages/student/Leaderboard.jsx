import { useEffect, useState } from "react";
import { Trophy, Flame, Crown } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Feedback";
import { initials, formatMinutesToHrs } from "../../utils/format";
import { getLeaderboard } from "../../api/studentApi";
import clsx from "clsx";

const PERIODS = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

const RANK_STYLES = {
  1: "bg-amber-400 text-white",
  2: "bg-ink-300 text-ink-950",
  3: "bg-amber-700 text-ink-50",
};

export default function Leaderboard() {
  const [period, setPeriod] = useState("month");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = (p) => {
    setLoading(true);
    getLeaderboard(p)
      .then(({ data }) => setEntries(data || []))
      .catch(() => toast.error("Couldn't load leaderboard", { id: "leaderboard" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaderboard(period); }, [period]);

  const top3 = entries.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50 flex items-center justify-center gap-2">
          <Trophy size={20} className="text-amber-400" /> Leaderboard
        </h2>
        <p className="text-sm text-ink-400 mt-1">Top study hours at your library</p>
      </div>

      <div className="flex gap-1.5 justify-center">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={clsx(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
              period === p.key ? "bg-amber-400 text-white" : "bg-ink-800 text-ink-300 hover:text-ink-100"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonCard />
      ) : entries.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-sm text-ink-400">
            No study data for this period yet. Punch in to appear on the leaderboard!
          </div>
        </Card>
      ) : (
        <>
          {/* Top 3 podium */}
          {podiumOrder.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 items-end">
              {podiumOrder.map((entry, i) => (
                <div
                  key={entry.studentId}
                  className={clsx(
                    "rounded-2xl border border-ink-700 bg-ink-850 p-4 text-center",
                    i === 1 && "pb-7 -mt-4 border-amber-400/40"
                  )}
                >
                  <div className={clsx("h-10 w-10 rounded-full mx-auto flex items-center justify-center text-sm font-semibold mb-2", RANK_STYLES[entry.rank] || "bg-ink-700 text-ink-300")}>
                    {entry.rank === 1 ? <Crown size={18} /> : initials(entry.name)}
                  </div>
                  <p className="text-xs text-ink-100 font-medium truncate">{entry.name}</p>
                  <p className="text-xs text-amber-400 mt-1">{formatMinutesToHrs(entry.minutes)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Full rankings */}
          <Card>
            <CardHeader><CardTitle>Full rankings</CardTitle></CardHeader>
            <CardBody className="space-y-1.5">
              {entries.map((entry) => (
                <div
                  key={entry.studentId}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3.5 py-3",
                    entry.you ? "bg-amber-400/10 border border-amber-400/30" : "hover:bg-ink-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx("h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold", RANK_STYLES[entry.rank] || "bg-ink-700 text-ink-300")}>
                      {entry.rank}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-ink-700 text-ink-200 flex items-center justify-center text-xs font-medium">
                      {initials(entry.name)}
                    </div>
                    <span className={clsx("text-sm", entry.you ? "text-amber-300 font-medium" : "text-ink-200")}>
                      {entry.name} {entry.you && <span className="text-xs text-ink-400">(you)</span>}
                    </span>
                  </div>
                  <span className="font-medium text-ink-100 text-sm">{formatMinutesToHrs(entry.minutes)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
