import { useEffect, useState } from "react";
import { CalendarCheck, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import StatCard from "../../components/ui/StatCard";
import { getLibraryAttendanceByDate } from "../../api/attendanceApi";
import { formatMinutesToHrs, formatDateTime } from "../../utils/format";

export default function AttendanceManagement() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = (d) => {
    setLoading(true);
    getLibraryAttendanceByDate(d)
      .then(({ data }) => setRecords(data || []))
      .catch(() => toast.error("Couldn't load attendance for this date", { id: "load-attendance" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttendance(date); }, [date]);

  const present = records.filter((r) => r.attendanceStatus === "IN").length;
  const totalMinutes = records.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);
  const avgMinutes = records.length ? totalMinutes / records.length : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Attendance</h2>
          <p className="text-sm text-ink-400 mt-0.5">Daily punch-in records across your library</p>
        </div>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Students present" value={present} icon={<CalendarCheck size={18} />} tone="amber" />
        <StatCard label="Total study time" value={formatMinutesToHrs(totalMinutes)} icon={<Clock3 size={18} />} tone="teal" />
        <StatCard label="Avg. session length" value={formatMinutesToHrs(avgMinutes)} icon={<Clock3 size={18} />} tone="info" />
      </div>

      <Card>
        <CardHeader><CardTitle>Records for {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</CardTitle></CardHeader>
        <CardBody className="p-0">
          <Table>
            <THead><tr><TH>Student</TH><TH>Punch in</TH><TH>Punch out</TH><TH>Study time</TH><TH>Status</TH></tr></THead>
            <TBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow cols={5} /></td></tr>)
              ) : records.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={<CalendarCheck size={26} />} title="No attendance records" description="No students have punched in on this date yet." /></td></tr>
              ) : (
                records.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-ink-100 font-medium">{r.studentName}</TD>
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
