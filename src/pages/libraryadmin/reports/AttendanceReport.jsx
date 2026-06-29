import { useEffect, useState } from "react";
import { CalendarCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ComparisonBarChart } from "../../../components/charts/Charts";
import { EmptyState } from "../../../components/ui/Feedback";
import { getAttendanceByDateRange } from "../../../api/attendanceApi";
import { PageHeader } from "./reportUtils";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export default function AttendanceReport() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const days = getLast7Days();
    const today = new Date().toISOString().split("T")[0];
    getAttendanceByDateRange(days[0], today)
      .then(r => {
        const records = r.data || [];
        const byDate = {};
        records.forEach(rec => { byDate[rec.attendanceDate] = (byDate[rec.attendanceDate] || 0) + 1; });
        setData(days.map(d => ({
          label: new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
          value: byDate[d] || 0,
        })));
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const avg   = data.length ? Math.round(total / data.length) : 0;
  const peak  = data.reduce((a, b) => b.value > a.value ? b : a, { value: 0, label: "—" });

  return (
    <div>
      <PageHeader title="Attendance Report" subtitle="Daily student visit count for last 7 days">
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Visits (7d)", value: total },
          { label: "Daily Average",     value: avg  },
          { label: `Peak — ${peak.label}`, value: peak.value },
        ].map((c, i) => (
          <div key={i} className="bg-ink-900 border border-ink-700 rounded-2xl p-4 text-center">
            <p className="text-2xl font-display font-bold text-ink-50">{c.value}</p>
            <p className="text-xs text-ink-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Daily Attendance — Last 7 Days</CardTitle></CardHeader>
        <CardBody>
          {loading
            ? <div className="h-48 bg-ink-800 animate-pulse rounded-xl"/>
            : data.every(d => d.value === 0)
              ? <EmptyState icon={<CalendarCheck size={24}/>} title="No attendance data" description="No students have checked in recently."/>
              : <ComparisonBarChart data={data} bars={[{ key: "value", color: "#6366f1" }]}/>
          }
        </CardBody>
      </Card>
    </div>
  );
}
