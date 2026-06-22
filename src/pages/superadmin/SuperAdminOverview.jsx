import { useEffect, useState } from "react";
import { Building2, Users, IndianRupee, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { RevenueAreaChart, DonutChart } from "../../components/charts/Charts";
import { getAllLibraries } from "../../api/superAdminApi";
import { SkeletonCard } from "../../components/ui/Feedback";

const REVENUE_TREND = [
  { label: "Jan", value: 184000 }, { label: "Feb", value: 201000 }, { label: "Mar", value: 219500 },
  { label: "Apr", value: 235000 }, { label: "May", value: 261000 }, { label: "Jun", value: 284500 },
];

export default function SuperAdminOverview() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLibraries()
      .then(({ data }) => setLibraries(data || []))
      .catch(() => toast.error("Couldn't load libraries — check the backend is running on :8080", { id: "super-overview-error" }))
      .finally(() => setLoading(false));
  }, []);

  const totalLibraries = libraries.length;
  const activeLibraries = libraries.filter((l) => l.status === "ACTIVE").length;
  const totalStudents = libraries.reduce((sum, l) => sum + (l.students?.length || 0), 0);

  const statusBreakdown = ["ACTIVE", "PENDING", "GRACE", "EXPIRED", "INACTIVE"]
    .map((status) => ({ name: status, value: libraries.filter((l) => l.status === status).length }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Platform overview</h2>
          <p className="text-sm text-ink-400 mt-0.5">Every library running on StudyHub, at a glance.</p>
        </div>
        <Link to="/superadmin/libraries">
          <Badge tone="amber" className="cursor-pointer">
            Manage libraries <ArrowRight size={12} />
          </Badge>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total libraries" value={totalLibraries} icon={<Building2 size={18} />} tone="amber" trend={8.2} trendLabel="vs last month" />
          <StatCard label="Active libraries" value={activeLibraries} icon={<TrendingUp size={18} />} tone="teal" trend={4.1} trendLabel="vs last month" />
          <StatCard label="Total students" value={totalStudents} icon={<Users size={18} />} tone="info" trend={12.5} trendLabel="vs last month" />
          <StatCard label="MRR (est.)" value={284500} prefix="₹" icon={<IndianRupee size={18} />} tone="amber" trend={9.6} trendLabel="vs last month" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue growth</CardTitle></CardHeader>
          <CardBody><RevenueAreaChart data={REVENUE_TREND} /></CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Library status mix</CardTitle></CardHeader>
          <CardBody>
            {statusBreakdown.length > 0 ? (
              <DonutChart data={statusBreakdown} />
            ) : (
              <p className="text-sm text-ink-400 text-center py-12">No libraries yet</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recently registered libraries</CardTitle>
          <Link to="/superadmin/libraries" className="text-xs text-amber-400 hover:text-amber-300 font-medium">View all</Link>
        </CardHeader>
        <CardBody className="p-0">
          {libraries.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-10">No libraries registered yet.</p>
          ) : (
            <div className="divide-y divide-ink-700">
              {libraries.slice(0, 5).map((lib) => (
                <div key={lib.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ink-800 flex items-center justify-center text-amber-400 shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-100">{lib.name}</p>
                      <p className="text-xs text-ink-500">{lib.email}</p>
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[lib.status] || "neutral"}>{lib.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
