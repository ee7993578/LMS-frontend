import { useEffect, useState } from "react";
import { FileBarChart, Download, AlertTriangle, Clock, CheckCircle, Users } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { RevenueAreaChart, ComparisonBarChart, DonutChart } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { SkeletonCard, SkeletonRow, EmptyState } from "../../components/ui/Feedback";
import { getLibraryAttendanceByDate, getAttendanceByDateRange } from "../../api/attendanceApi";
import { getAllStudents, getLibraryFees, getAllPlans, getSubscriptionExpiryReport } from "../../api/libraryAdminApi";
import { getAllSeats } from "../../api/seatApi";
import { formatDate } from "../../utils/format";

const TABS = [
  { id: "fee-report", label: "Fee Report" },
  { id: "attendance", label: "Attendance" },
  { id: "revenue", label: "Revenue" },
  { id: "students", label: "Students" },
  { id: "seats", label: "Seat utilization" },
  { id: "plans", label: "Plans" },
];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function daysBadge(days, type) {
  if (type === "ago") {
    if (days === 0) return <Badge tone="danger">Today</Badge>;
    if (days === 1) return <Badge tone="danger">Yesterday</Badge>;
    return <Badge tone="danger">{days} days ago</Badge>;
  }
  if (days === 0) return <Badge tone="warning">Expires Today</Badge>;
  if (days === 1) return <Badge tone="warning">Tomorrow</Badge>;
  return <Badge tone="warning">In {days} days</Badge>;
}

export default function Reports() {
  const [tab, setTab] = useState("fee-report");
  const [attendanceData, setAttendanceData] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fee report state
  const [feeReport, setFeeReport] = useState(null);
  const [feeReportLoading, setFeeReportLoading] = useState(false);

  const loadFeeReport = async () => {
    setFeeReportLoading(true);
    try {
      const res = await getSubscriptionExpiryReport();
      setFeeReport(res.data);
    } catch {
      toast.error("Failed to load subscription report");
    } finally {
      setFeeReportLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.allSettled([
      getAttendanceByDateRange(getLast7Days()[0], today),
      getLibraryFees(),
      getAllStudents(),
      getAllPlans(),
      getAllSeats(),
    ]).then(([attRes, feeRes, studRes, planRes, seatRes]) => {
      if (attRes.status === "fulfilled") {
        const records = attRes.value.data || [];
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

    // Load fee report initially
    loadFeeReport();
  }, []);

  // Derived data
  const revenueByMonth = {};
  fees.forEach((f) => {
    const key = `Month ${f.monthId}`;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + (f.Receive || 0);
  });
  const revenueData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));

  const planCount = {};
  students.forEach((s) => {
    const name = s.plan?.name || "No plan";
    planCount[name] = (planCount[name] || 0) + 1;
  });
  const planDistribution = Object.entries(planCount).map(([name, value]) => ({ name, value }));

  const seatByLocation = {};
  seats.forEach((s) => {
    const loc = s.location || "Unassigned";
    if (!seatByLocation[loc]) seatByLocation[loc] = { label: loc, occupied: 0, available: 0 };
    if (s.status === "ALLOCATED") seatByLocation[loc].occupied++;
    else if (s.status === "AVAILABLE") seatByLocation[loc].available++;
  });
  const seatUtilization = Object.values(seatByLocation);

  const planRevenue = {};
  fees.forEach((f) => {
    const student = students.find((s) => s.id === f.studentId);
    const planName = student?.plan?.name || "Unknown";
    planRevenue[planName] = (planRevenue[planName] || 0) + (f.Receive || 0);
  });
  const planRevenueData = Object.entries(planRevenue).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Reports</h2>
          <p className="text-sm text-ink-400 mt-0.5">Analytics across attendance, revenue, students, and fees</p>
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

      {/* ===== FEE REPORT TAB ===== */}
      {tab === "fee-report" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-400">
              Subscriptions expiring in next 7 days &amp; already expired students
            </p>
            <Button variant="secondary" size="sm" onClick={loadFeeReport} loading={feeReportLoading}>
              Refresh
            </Button>
          </div>

          {feeReportLoading ? (
            <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
          ) : feeReport ? (
            <>
              {/* Summary Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard
                  label="Already Expired"
                  value={feeReport.expiredCount}
                  icon={<AlertTriangle size={18} />}
                  tone="danger"
                />
                <StatCard
                  label="Expiring in 7 Days"
                  value={feeReport.expiringSoonCount}
                  icon={<Clock size={18} />}
                  tone="amber"
                />
                <StatCard
                  label="Total Students"
                  value={students.length}
                  icon={<Users size={18} />}
                  tone="info"
                />
              </div>

              {/* Expiring Soon — Next 7 Days */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      Expiring Soon — Next 7 Days
                    </CardTitle>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {feeReport.expiringSoonCount} student{feeReport.expiringSoonCount !== 1 ? "s" : ""} need renewal
                    </p>
                  </div>
                  <Badge tone="warning">{feeReport.expiringSoonCount} upcoming</Badge>
                </CardHeader>
                <CardBody>
                  {feeReport.expiringSoon.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <CheckCircle size={28} className="text-success" />
                      <p className="text-sm text-ink-400">No subscriptions expiring in the next 7 days.</p>
                    </div>
                  ) : (
                    <Table>
                      <THead>
                        <tr>
                          <TH>#</TH>
                          <TH>Student</TH>
                          <TH>Phone</TH>
                          <TH>Plan</TH>
                          <TH>Date of Join</TH>
                          <TH>Expiry Date</TH>
                          <TH>Status</TH>
                        </tr>
                      </THead>
                      <TBody>
                        {feeReport.expiringSoon.map((s, i) => (
                          <TR key={s.studentId}>
                            <TD className="text-ink-500 text-xs">{i + 1}</TD>
                            <TD className="font-medium text-ink-100">{s.fullName}</TD>
                            <TD>{s.phone || "—"}</TD>
                            <TD>
                              <span className="text-amber-300 text-xs font-medium">{s.planName || "—"}</span>
                            </TD>
                            <TD className="text-ink-400 text-sm">{s.dateOfJoin ? formatDate(s.dateOfJoin) : "—"}</TD>
                            <TD className="font-medium text-ink-100">{formatDate(s.expiryDate)}</TD>
                            <TD>{daysBadge(s.daysLeft, "left")}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </CardBody>
              </Card>

              {/* Already Expired */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-danger" />
                      Already Expired
                    </CardTitle>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {feeReport.expiredCount} student{feeReport.expiredCount !== 1 ? "s" : ""} with lapsed subscriptions
                    </p>
                  </div>
                  <Badge tone="danger">{feeReport.expiredCount} expired</Badge>
                </CardHeader>
                <CardBody>
                  {feeReport.expired.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <CheckCircle size={28} className="text-success" />
                      <p className="text-sm text-ink-400">No expired subscriptions. All students are active!</p>
                    </div>
                  ) : (
                    <Table>
                      <THead>
                        <tr>
                          <TH>#</TH>
                          <TH>Student</TH>
                          <TH>Phone</TH>
                          <TH>Plan</TH>
                          <TH>Date of Join</TH>
                          <TH>Expired On</TH>
                          <TH>Status</TH>
                        </tr>
                      </THead>
                      <TBody>
                        {feeReport.expired.map((s, i) => (
                          <TR key={s.studentId}>
                            <TD className="text-ink-500 text-xs">{i + 1}</TD>
                            <TD className="font-medium text-ink-100">{s.fullName}</TD>
                            <TD>{s.phone || "—"}</TD>
                            <TD>
                              <span className="text-ink-300 text-xs font-medium">{s.planName || "—"}</span>
                            </TD>
                            <TD className="text-ink-400 text-sm">{s.dateOfJoin ? formatDate(s.dateOfJoin) : "—"}</TD>
                            <TD className="text-danger font-medium">{formatDate(s.expiryDate)}</TD>
                            <TD>{daysBadge(s.daysAgo, "ago")}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={<FileBarChart size={26} />}
                title="No report data"
                description="Click refresh to load subscription expiry report."
                actionLabel="Load Report"
                onAction={loadFeeReport}
              />
            </Card>
          )}
        </div>
      )}

      {/* ===== OTHER TABS ===== */}
      {loading && tab !== "fee-report" ? (
        <div className="grid sm:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          {tab === "attendance" && (
            <Card>
              <CardHeader><CardTitle>Attendance — last 7 days</CardTitle></CardHeader>
              <CardBody>
                {attendanceData.length > 0
                  ? <ComparisonBarChart data={attendanceData} bars={[{ key: "value", color: "#6366f1" }]} />
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
                  ? <ComparisonBarChart data={seatUtilization} bars={[{ key: "occupied", color: "#6366f1" }, { key: "available", color: "#3b82f6" }]} />
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
