import { useEffect, useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { RevenueAreaChart, ComparisonBarChart, DonutChart, TrendLineChart } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Feedback";
import { getLibraryAttendanceByDate, getAttendanceByDateRange } from "../../api/attendanceApi";
import { getAllStudents } from "../../api/libraryAdminApi";
import { getLibraryFees } from "../../api/libraryAdminApi";
import { getAllPlans } from "../../api/libraryAdminApi";
import { getAllSeats } from "../../api/seatApi";

const TABS = [
  { id: "attendance", label: "Attendance" },
  { id: "revenue", label: "Revenue" },
  { id: "students", label: "Students" },
  { id: "seats", label: "Seat utilization" },
  { id: "plans", label: "Plans" },
];

// Build last 7 days date range
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function Reports() {
  const [tab, setTab] = useState("attendance");
  const [attendanceData, setAttendanceData] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startDate = startOfMonth.toISOString().split("T")[0];

    Promise.allSettled([
      getAttendanceByDateRange(
        getLast7Days()[0],
        today
      ),
      getLibraryFees(),
      getAllStudents(),
      getAllPlans(),
      getAllSeats(),
    ]).then(([attRes, feeRes, studRes, planRes, seatRes]) => {
      if (attRes.status === "fulfilled") {
        const records = attRes.value.data || [];
        // Group by date
        const byDate = {};
        records.forEach((r) => {
          const d = r.attendanceDate;
          if (!byDate[d]) byDate[d] = 0;
          byDate[d]++;
        });
        const days = getLast7Days();
        setAttendanceData(days.map((d) => ({
          label: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }),
          value: byDate[d] || 0,
        })));
      }
      if (feeRes.status === "fulfilled") setFees(feeRes.value.data || []);
      if (studRes.status === "fulfilled") setStudents(studRes.value.data || []);
      if (planRes.status === "fulfilled") setPlans(planRes.value.data || []);
      if (seatRes.status === "fulfilled") setSeats(seatRes.value.data || []);
    }).catch(() => toast.error("Some report data failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Derived data
  // Revenue: group fees by month
  const revenueByMonth = {};
  fees.forEach((f) => {
    const key = `Month ${f.monthId}`;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + (f.Receive || 0);
  });
  const revenueData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));

  // Plan distribution among students
  const planCount = {};
  students.forEach((s) => {
    const name = s.plan?.name || "No plan";
    planCount[name] = (planCount[name] || 0) + 1;
  });
  const planDistribution = Object.entries(planCount).map(([name, value]) => ({ name, value }));

  // Seat utilization by location
  const seatByLocation = {};
  seats.forEach((s) => {
    const loc = s.location || "Unassigned";
    if (!seatByLocation[loc]) seatByLocation[loc] = { label: loc, occupied: 0, available: 0 };
    if (s.status === "ALLOCATED") seatByLocation[loc].occupied++;
    else if (s.status === "AVAILABLE") seatByLocation[loc].available++;
  });
  const seatUtilization = Object.values(seatByLocation);

  // Revenue per plan
  const planRevenue = {};
  fees.forEach((f) => {
    const student = students.find((s) => s.id === (f.studentId));
    const planName = student?.plan?.name || "Unknown";
    planRevenue[planName] = (planRevenue[planName] || 0) + (f.Receive || 0);
  });
  const planRevenueData = Object.entries(planRevenue).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Reports</h2>
          <p className="text-sm text-ink-400 mt-0.5">Analytics across attendance, revenue, students, and seats</p>
        </div>
        <Button variant="secondary" size="sm"><Download size={14} /> Export</Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-ink-700 pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? "border-amber-400 text-amber-300" : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          {tab === "attendance" && (
            <Card>
              <CardHeader><CardTitle>Attendance — last 7 days</CardTitle></CardHeader>
              <CardBody>
                {attendanceData.length > 0
                  ? <ComparisonBarChart data={attendanceData} bars={[{ key: "value", color: "#f5a83c" }]} />
                  : <p className="text-sm text-ink-400 text-center py-16">No attendance data for the past 7 days.</p>}
              </CardBody>
            </Card>
          )}

          {tab === "revenue" && (
            <Card>
              <CardHeader><CardTitle>Revenue by month</CardTitle></CardHeader>
              <CardBody>
                {revenueData.length > 0
                  ? <RevenueAreaChart data={revenueData} />
                  : <p className="text-sm text-ink-400 text-center py-16">No fee collections recorded yet.</p>}
              </CardBody>
            </Card>
          )}

          {tab === "students" && (
            <div className="grid lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader>
                <CardBody>
                  {planDistribution.length > 0
                    ? <DonutChart data={planDistribution} />
                    : <p className="text-sm text-ink-400 text-center py-12">No students assigned to plans yet.</p>}
                </CardBody>
              </Card>
              <Card>
                <CardHeader><CardTitle>Total students: {students.length}</CardTitle></CardHeader>
                <CardBody className="space-y-2">
                  {plans.map((p) => {
                    const count = students.filter((s) => s.plan?.id === p.id).length;
                    return (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-ink-700 p-3">
                        <span className="text-sm text-ink-200">{p.name}</span>
                        <span className="text-sm font-medium text-amber-300">{count} students</span>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            </div>
          )}

          {tab === "seats" && (
            <Card>
              <CardHeader><CardTitle>Seat utilization by zone</CardTitle></CardHeader>
              <CardBody>
                {seatUtilization.length > 0
                  ? <ComparisonBarChart data={seatUtilization} bars={[{ key: "occupied", color: "#f5a83c" }, { key: "available", color: "#2db89f" }]} />
                  : <p className="text-sm text-ink-400 text-center py-16">No seats configured yet.</p>}
              </CardBody>
            </Card>
          )}

          {tab === "plans" && (
            <Card>
              <CardHeader><CardTitle>Revenue by plan</CardTitle></CardHeader>
              <CardBody>
                {planRevenueData.length > 0
                  ? <DonutChart data={planRevenueData} />
                  : <p className="text-sm text-ink-400 text-center py-16">No fee data available.</p>}
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
