import { useEffect, useState, Fragment } from "react";
import { CalendarCheck, Clock3, ChevronDown, ChevronUp, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { TrendLineChart } from "../../components/charts/Charts";
import { getMonthAttendance } from "../../api/attendanceApi";
import { formatMinutesToHrs, formatDate, formatDateTime } from "../../utils/format";

function isWithinLast7Days(dateStr) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff;
}

function formatClock(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Each punch in/out pair of a day, shown when the row is expanded.
function SlotBreakdown({ slots }) {
  if (!slots || slots.length === 0) return null;
  return (
    <div className="px-4 pb-3 pt-1 space-y-1.5 bg-ink-900/40">
      {slots.map((s) => (
        <div key={s.slotNumber} className="flex items-center justify-between text-xs">
          <span className="text-ink-400">
            Slot {s.slotNumber} · {formatClock(s.punchIn)} — {s.punchOut ? formatClock(s.punchOut) : "ongoing"}
            {s.autoClosed && <span className="ml-1.5 text-amber-400">(auto punched-out)</span>}
          </span>
          <span className="text-ink-300 font-mono">{s.punchOut ? formatMinutesToHrs(s.durationMinutes) : "…"}</span>
        </div>
      ))}
    </div>
  );
}

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getMonthAttendance().then(({ data }) => setRecords(data || [])).catch(() => toast.error("Couldn't load attendance history", { id: "load-attendance-history" })).finally(() => setLoading(false));
  }, []);

  const totalMinutes = records.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);
  const avgMinutes = records.length ? totalMinutes / records.length : 0;

  const weekRecords = records.filter((r) => isWithinLast7Days(r.attendanceDate));
  const weekMinutes = weekRecords.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);

  const chartData = records.map((r) => ({
    label: new Date(r.attendanceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    value: Math.round((r.totalStudyMinutes || 0) / 60),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">My attendance</h2>
        <p className="text-sm text-ink-400 mt-0.5">Every session this month</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This week" value={formatMinutesToHrs(weekMinutes)} icon={<CalendarDays size={18} />} tone="success" />
        <StatCard label="Total this month" value={formatMinutesToHrs(totalMinutes)} icon={<Clock3 size={18} />} tone="amber" />
        <StatCard label="Avg. day" value={formatMinutesToHrs(avgMinutes)} icon={<Clock3 size={18} />} tone="teal" />
        <StatCard label="Days logged" value={records.length} icon={<CalendarCheck size={18} />} tone="info" />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Study hours trend</CardTitle></CardHeader>
          <CardBody><TrendLineChart data={chartData} color="#6366f1" /></CardBody>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Session history</CardTitle></CardHeader>
        <CardBody className="p-0">
          <Table>
            <THead><tr><TH>Date</TH><TH>First punch in</TH><TH>Last punch out</TH><TH>Study time</TH><TH>Sessions</TH><TH>Status</TH></tr></THead>
            <TBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)
              ) : records.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<CalendarCheck size={26} />} title="No sessions yet" description="Punch in to start logging your study sessions." /></td></tr>
              ) : (
                records.map((r) => {
                  const slotCount = r.slots?.length || 0;
                  const expanded = expandedId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <TR
                        className={slotCount > 0 ? "cursor-pointer" : ""}
                        onClick={() => slotCount > 0 && setExpandedId(expanded ? null : r.id)}
                      >
                        <TD>{formatDate(r.attendanceDate)}</TD>
                        <TD>{formatDateTime(r.shiftStart)}</TD>
                        <TD>{r.shiftEnd ? formatDateTime(r.shiftEnd) : "—"}</TD>
                        <TD>{formatMinutesToHrs(r.totalStudyMinutes)}</TD>
                        <TD>
                          {slotCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-ink-300">
                              {slotCount} {slotCount === 1 ? "slot" : "slots"}
                              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          ) : "—"}
                        </TD>
                        <TD><Badge tone={STATUS_TONE[r.attendanceStatus]}>{r.attendanceStatus}</Badge></TD>
                      </TR>
                      {expanded && (
                        <tr>
                          <td colSpan={6}><SlotBreakdown slots={r.slots} /></td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
