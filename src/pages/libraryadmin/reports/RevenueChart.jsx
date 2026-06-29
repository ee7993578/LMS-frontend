import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { RevenueAreaChart, ComparisonBarChart, DonutChart } from "../../../components/charts/Charts";
import { EmptyState } from "../../../components/ui/Feedback";
import { getMonthlyCollectionReport } from "../../../api/paymentApi";
import { getAllStudents, getAllPlans } from "../../../api/libraryAdminApi";
import { getAllSeats } from "../../../api/seatApi";
import { monthIdToLabel } from "../../../utils/format";
import { PageHeader } from "./reportUtils";

export default function RevenueChart() {
  const [monthly, setMonthly] = useState(null);
  const [students, setStudents] = useState([]);
  const [seats, setSeats]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getMonthlyCollectionReport(),
      getAllStudents(),
      getAllSeats(),
    ]).then(([mR, stR, seR]) => {
      if (mR.status === "fulfilled") setMonthly(mR.value.data);
      if (stR.status === "fulfilled") setStudents(stR.value.data || []);
      if (seR.status === "fulfilled") setSeats(seR.value.data || []);
    }).catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const revenueData = (monthly?.months || []).map(m => ({ label: monthIdToLabel(m.monthId), value: m.collectedAmount }));

  const planCount = {};
  students.forEach(s => { const n = s.plan?.name || "No plan"; planCount[n] = (planCount[n] || 0) + 1; });
  const planData = Object.entries(planCount).map(([name, value]) => ({ name, value }));

  const seatByLoc = {};
  seats.forEach(s => {
    const l = s.location || "Other";
    if (!seatByLoc[l]) seatByLoc[l] = { label: l, occupied: 0, available: 0 };
    s.status === "ALLOCATED" ? seatByLoc[l].occupied++ : seatByLoc[l].available++;
  });

  return (
    <div>
      <PageHeader title="Revenue & Analytics" subtitle="Visual charts for collection, plans and seat usage">
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
          <CardBody>
            {loading ? <div className="h-48 bg-ink-800 animate-pulse rounded-xl"/>
              : revenueData.length > 0
                ? <RevenueAreaChart data={revenueData}/>
                : <EmptyState icon={<TrendingUp size={24}/>} title="No revenue data" description="No fee collections recorded yet."/>
            }
          </CardBody>
        </Card>

        <div className="grid sm:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
            <CardBody>
              {loading ? <div className="h-48 bg-ink-800 animate-pulse rounded-xl"/>
                : planData.length > 0
                  ? <DonutChart data={planData}/>
                  : <EmptyState icon={<TrendingUp size={22}/>} title="No plan data" description="Assign plans to students to see distribution."/>
              }
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Seat Utilization by Zone</CardTitle></CardHeader>
            <CardBody>
              {loading ? <div className="h-48 bg-ink-800 animate-pulse rounded-xl"/>
                : Object.values(seatByLoc).length > 0
                  ? <ComparisonBarChart data={Object.values(seatByLoc)} bars={[{ key: "occupied", color: "#6366f1" }, { key: "available", color: "#3b82f6" }]}/>
                  : <EmptyState icon={<TrendingUp size={22}/>} title="No seat data" description="Add seats to see utilization."/>
              }
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
