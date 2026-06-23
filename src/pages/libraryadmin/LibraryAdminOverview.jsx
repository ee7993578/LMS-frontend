import { useEffect, useState } from "react";
import { Users, Armchair, IndianRupee, Clock3, AlertTriangle, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { TrendLineChart, DonutChart } from "../../components/charts/Charts";
import { SkeletonCard } from "../../components/ui/Feedback";
import { getAllStudents, getLibraryFees } from "../../api/libraryAdminApi";
import { getAllSeats } from "../../api/seatApi";
import { getLibraryAttendanceByDate, getAttendanceByDateRange } from "../../api/attendanceApi";
import { formatMinutesToHrs } from "../../utils/format";

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function LibraryAdminOverview() {
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [weekTrend, setWeekTrend] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = getLast7Days()[0];

    Promise.allSettled([
      getAllStudents(),
      getAllSeats(),
      getLibraryAttendanceByDate(today),
      getAttendanceByDateRange(sevenDaysAgo, today),
      getLibraryFees(),
    ]).then(([s, seatRes, attRes, weekRes, feeRes]) => {
      if (s.status === "fulfilled") setStudents(s.value.data || []);
      if (seatRes.status === "fulfilled") setSeats(seatRes.value.data || []);
      if (attRes.status === "fulfilled") setAttendance(attRes.value.data || []);
      if (weekRes.status === "fulfilled") {
        const records = weekRes.value.data || [];
        const days = getLast7Days();
        const byDate = {};
        records.forEach((r) => { byDate[r.attendanceDate] = (byDate[r.attendanceDate] || 0) + 1; });
        setWeekTrend(days.map((d) => ({
          label: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }),
          value: byDate[d] || 0,
        })));
      }
      if (feeRes.status === "fulfilled") setFees(feeRes.value.data || []);
      if ([s, seatRes, attRes].some((r) => r.status === "rejected")) {
        toast.error("Some dashboard data couldn't load — check the backend connection", { id: "admin-overview-error" });
      }
    }).finally(() => setLoading(false));
  }, []);

  const occupied = seats.filter((s) => s.status === "ALLOCATED").length;
  const available = seats.filter((s) => s.status === "AVAILABLE").length;
  const maintenance = seats.filter((s) => s.status === "UNDER_MAINTENANCE").length;
  const todayPresent = attendance.filter((a) => a.attendanceStatus === "IN").length;
  const totalStudyMinutesToday = attendance.reduce((sum, a) => sum + (a.totalStudyMinutes || 0), 0);

  const seatBreakdown = [
    { name: "Occupied", value: occupied },
    { name: "Available", value: available },
    { name: "Maintenance", value: maintenance },
  ].filter((d) => d.value > 0);

  const overdueCount = fees.filter((f) => f.feeStatus === "UNPAID").length;
  const expiringStudents = students.filter((s) => s.plan && s.plan.duration <= 3).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-50">Today's overview</h2>
        <p className="text-sm text-ink-400 mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Students present today" value={todayPresent} icon={<Users size={18} />} tone="amber" />
          <StatCard label="Occupied seats" value={occupied} suffix={` / ${seats.length}`} icon={<Armchair size={18} />} tone="teal" />
          <StatCard label="Total study time today" value={formatMinutesToHrs(totalStudyMinutesToday)} icon={<Clock3 size={18} />} tone="info" />
          <StatCard label="Total students" value={students.length} icon={<Users size={18} />} tone="amber" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Attendance — last 7 days</CardTitle></CardHeader>
          <CardBody>
            {weekTrend.length > 0
              ? <TrendLineChart data={weekTrend} color="#6366f1" />
              : <p className="text-sm text-ink-400 text-center py-12">No attendance data yet.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Seat status</CardTitle></CardHeader>
          <CardBody>
            {seatBreakdown.length > 0 ? <DonutChart data={seatBreakdown} /> : (
              <p className="text-sm text-ink-400 text-center py-12">No seats configured yet</p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending actions</CardTitle>
            <Bell size={16} className="text-ink-400" />
          </CardHeader>
          <CardBody className="space-y-3">
            {expiringStudents > 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-soft p-3.5">
                <AlertTriangle size={16} className="text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="text-ink-100">{expiringStudents} student{expiringStudents > 1 ? "s" : ""} on short plans</p>
                  <Link to="/admin/students" className="text-xs text-amber-400 hover:text-amber-300">Review students →</Link>
                </div>
              </div>
            )}
            {overdueCount > 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-danger-soft p-3.5">
                <IndianRupee size={16} className="text-danger mt-0.5" />
                <div className="text-sm">
                  <p className="text-ink-100">{overdueCount} student{overdueCount > 1 ? "s" : ""} with unpaid fees</p>
                  <Link to="/admin/fees" className="text-xs text-amber-400 hover:text-amber-300">Go to fees →</Link>
                </div>
              </div>
            )}
            {overdueCount === 0 && expiringStudents === 0 && (
              <p className="text-sm text-ink-400 text-center py-4">No pending actions — all clear!</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            {[
              { to: "/admin/students", label: "Add student", icon: Users },
              { to: "/admin/seats", label: "Seat map", icon: Armchair },
              { to: "/admin/fees", label: "Collect fee", icon: IndianRupee },
              { to: "/admin/qr", label: "QR attendance", icon: Clock3 },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="flex flex-col items-start gap-2 rounded-xl border border-ink-700 p-3.5 hover:border-amber-400/40 hover:bg-ink-800 transition-colors">
                <q.icon size={18} className="text-amber-400" />
                <span className="text-sm text-ink-200">{q.label}</span>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
