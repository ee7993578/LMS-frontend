import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Clock3, Armchair, Wallet, ArrowRight, Trophy, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { TrendLineChart } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Feedback";
import { getMonthAttendance } from "../../api/attendanceApi";
import { getMyFees } from "../../api/studentApi";
import { formatMinutesToHrs } from "../../utils/format";

export default function StudentDashboard() {
  const [records, setRecords] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getMonthAttendance(), getMyFees()]).then(([attRes, feeRes]) => {
      if (attRes.status === "fulfilled") setRecords(attRes.value.data || []);
      else toast.error("Couldn't load your attendance — check your library admin has set up your account", { id: "student-dash-error" });
      if (feeRes.status === "fulfilled") setFees(feeRes.value.data || []);
      setLoading(false);
    });
  }, []);

  const totalMinutesMonth = records.reduce((sum, r) => sum + (r.totalStudyMinutes || 0), 0);
  const sessionsThisMonth = records.length;
  const todayRecord = records.find((r) => {
    const d = new Date(r.attendanceDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  // Simple streak: count consecutive days (from most recent) with a record present
  const streak = (() => {
    const dates = new Set(records.map((r) => r.attendanceDate));
    let count = 0;
    let cursor = new Date();
    while (dates.has(cursor.toISOString().split("T")[0])) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const trend = records.slice(-7).map((r) => ({
    label: new Date(r.attendanceDate).toLocaleDateString("en-IN", { weekday: "short" }),
    value: Math.round((r.totalStudyMinutes || 0) / 60),
  }));

  const latestFee = fees.length > 0
    ? fees.reduce((latest, f) => (f.monthId > latest.monthId ? f : latest), fees[0])
    : null;
  const feeStatusLabel = latestFee
    ? latestFee.feeStatus === "PAID" ? "Paid" : latestFee.feeStatus === "PARTIAL" ? "Partial" : "Unpaid"
    : "No record";
  const feeStatusTone = latestFee?.feeStatus === "PAID" ? "teal" : latestFee?.feeStatus === "PARTIAL" ? "amber" : "danger";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-400/20 bg-ink-850 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 lamp-glow" />
        <div className="relative z-10">
          <p className="text-sm text-ink-400">Welcome back</p>
          <h2 className="font-display text-2xl text-ink-50 mt-1">
            {todayRecord?.attendanceStatus === "IN" ? "You're currently studying" : "Ready to start your session?"}
          </h2>
        </div>
        <Link to="/student/punch" className="relative z-10">
          <Button size="lg">Go to punch in/out <ArrowRight size={16} /></Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Study streak" value={streak} suffix=" days" icon={<Flame size={18} />} tone="amber" />
          <StatCard label="This month" value={formatMinutesToHrs(totalMinutesMonth)} icon={<Clock3 size={18} />} tone="teal" />
          <StatCard label="Sessions" value={sessionsThisMonth} icon={<Armchair size={18} />} tone="info" />
          <Link to="/student/fees">
            <StatCard label="Fee status" value={feeStatusLabel} icon={<Wallet size={18} />} tone={feeStatusTone} />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Study hours — last 7 sessions</CardTitle></CardHeader>
          <CardBody>
            {trend.length > 0 ? (
              <TrendLineChart data={trend} color="#6366f1" />
            ) : (
              <p className="text-sm text-ink-400 text-center py-16">No sessions yet — punch in to start tracking.</p>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Leaderboard</CardTitle>
              <Trophy size={16} className="text-amber-400" />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-ink-400 mb-3">See how your study hours compare with others at your library.</p>
              <Link to="/student/leaderboard">
                <Button variant="secondary" className="w-full">View leaderboard</Button>
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>To-Do List</CardTitle>
              <CheckSquare size={16} className="text-teal-400" />
            </CardHeader>
            <CardBody>
              <p className="text-sm text-ink-400 mb-3">Plan your study session — track tasks, revisions, and daily goals.</p>
              <Link to="/student/todo">
                <Button variant="secondary" className="w-full">Open To-Do List <ArrowRight size={14} /></Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
