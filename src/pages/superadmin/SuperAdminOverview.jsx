import { useEffect, useState } from "react";
import { Building2, Users, IndianRupee, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { DonutChart } from "../../components/charts/Charts";
import { getAllLibraries, getSuperAdminDashboard } from "../../api/superAdminApi";
import { SkeletonCard } from "../../components/ui/Feedback";

const STATUS_LABEL = {
  TRIAL: "Trial",
  TRIAL_READ_ONLY: "Trial expired",
  ACTIVE: "Active",
  EXPIRED_READ_ONLY: "Subscription expired",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
  PENDING: "Pending",
};

export default function SuperAdminOverview() {
  const [libraries, setLibraries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllLibraries(), getSuperAdminDashboard()])
      .then(([librariesRes, statsRes]) => {
        setLibraries(librariesRes.data || []);
        setStats(statsRes.data || null);
      })
      .catch(() => toast.error("Couldn't load dashboard — check the backend is running on :8080", { id: "super-overview-error" }))
      .finally(() => setLoading(false));
  }, []);

  const statusBreakdown = ["TRIAL", "TRIAL_READ_ONLY", "ACTIVE", "EXPIRED_READ_ONLY", "INACTIVE", "DELETED"]
    .map((status) => ({ name: STATUS_LABEL[status] || status, value: libraries.filter((l) => l.status === status).length }))
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
          <StatCard label="Total libraries" value={stats?.totalLibraries ?? 0} icon={<Building2 size={18} />} tone="amber" />
          <StatCard label="Active libraries" value={stats?.activeLibraries ?? 0} icon={<TrendingUp size={18} />} tone="teal" />
          <StatCard label="Total students" value={stats?.totalStudents ?? 0} icon={<Users size={18} />} tone="info" />
          <StatCard label="MRR" value={Math.round(stats?.monthlyRecurringRevenue ?? 0)} prefix="₹" icon={<IndianRupee size={18} />} tone="amber" />
        </div>
      )}

      {!loading && stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-ink-500">Trial libraries</p>
            <p className="font-display text-2xl text-ink-50 mt-1">{stats.trialLibraries}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-500">Expired (read-only)</p>
            <p className="font-display text-2xl text-ink-50 mt-1">{stats.expiredLibraries}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-500">Inactive</p>
            <p className="font-display text-2xl text-ink-50 mt-1">{stats.inactiveLibraries}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-500">Deleted</p>
            <p className="font-display text-2xl text-ink-50 mt-1">{stats.deletedLibraries}</p>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <CardHeader><CardTitle>Revenue summary</CardTitle></CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-4">
                <p className="text-xs text-ink-500">Monthly recurring revenue</p>
                <p className="font-display text-2xl text-ink-50 mt-1">₹{Math.round(stats?.monthlyRecurringRevenue ?? 0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-ink-500 mt-1">Sum of active subscriptions' monthly price</p>
              </div>
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-4">
                <p className="text-xs text-ink-500">Total revenue collected (est.)</p>
                <p className="font-display text-2xl text-ink-50 mt-1">₹{Math.round(stats?.totalRevenueCollected ?? 0).toLocaleString("en-IN")}</p>
                <p className="text-xs text-ink-500 mt-1">Best-effort estimate based on billing history</p>
              </div>
            </div>
          </CardBody>
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
                  <Badge tone={STATUS_TONE[lib.status] || "neutral"}>{STATUS_LABEL[lib.status] || lib.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
