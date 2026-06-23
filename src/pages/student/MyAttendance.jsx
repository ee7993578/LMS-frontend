import { useEffect, useState } from "react";
import { CalendarCheck, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { TrendLineChart } from "../../components/charts/Charts";
import { getMonthAttendance } from "../../api/attendanceApi";
import { formatMinutesToHrs, formatDate, formatDateTime } from "../../utils/format";

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMonthAttendance().then(({ data }) => setRecords(data || [])).catch(() => toast.error("Couldn't load attendance history", { id: "load-attendance-history" })).finally(() => setLoading(false));
  }, []);

  const totalMinutes = records.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);
  const avgMinutes = records.length ? totalMinutes / records.length : 0;

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

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total this month" value={formatMinutesToHrs(totalMinutes)} icon={<Clock3 size={18} />} tone="amber" />
        <StatCard label="Avg. session" value={formatMinutesToHrs(avgMinutes)} icon={<Clock3 size={18} />} tone="teal" />
        <StatCard label="Sessions logged" value={records.length} icon={<CalendarCheck size={18} />} tone="info" />
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
            <THead><tr><TH>Date</TH><TH>Punch in</TH><TH>Punch out</TH><TH>Study time</TH><TH>Status</TH></tr></THead>
            <TBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow cols={5} /></td></tr>)
              ) : records.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={<CalendarCheck size={26} />} title="No sessions yet" description="Punch in to start logging your study sessions." /></td></tr>
              ) : (
                records.map((r) => (
                  <TR key={r.id}>
                    <TD>{formatDate(r.attendanceDate)}</TD>
                    <TD>{formatDateTime(r.shiftStart)}</TD>
                    <TD>{r.shiftEnd ? formatDateTime(r.shiftEnd) : "—"}</TD>
                    <TD>{formatMinutesToHrs(r.totalStudyMinutes)}</TD>
                    <TD><Badge tone={STATUS_TONE[r.attendanceStatus]}>{r.attendanceStatus}</Badge></TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
