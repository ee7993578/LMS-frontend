import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp, AlertTriangle, Clock, LifeBuoy, IndianRupee, Activity, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Feedback";
import { RevenueAreaChart, ComparisonBarChart, DonutChart } from "../../components/charts/Charts";
import { formatCurrency } from "../../utils/format";
import api from "../../api/axios";
import { getAllTickets } from "../../api/ticketApi";

export default function SuperAdminOverview() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/api/superadmin/dashboard")
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="grid sm:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><SkeletonCard key={i}/>)}</div>;
  if (!data) return null;

  const growthData = Object.entries(data.libraryGrowth||{}).map(([label,value])=>({label,value}));
  const planData   = Object.entries(data.planDistribution||{}).map(([name,value])=>({name,value}));
  const statusData = Object.entries(data.statusDistribution||{}).map(([label,value])=>({label,value}));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Super Admin Dashboard</h2>
          <p className="text-sm text-ink-400 mt-0.5">Platform-wide SaaS analytics</p>
        </div>
        <Button size="sm" variant="secondary" onClick={load}><RefreshCw size={13}/> Refresh</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Libraries"   value={data.totalLibraries}   icon={<Building2 size={18}/>}   tone="info"    />
        <StatCard label="Active Libraries"  value={data.activeLibraries}  icon={<Activity size={18}/>}    tone="teal"    />
        <StatCard label="Trial Libraries"   value={data.trialLibraries}   icon={<Clock size={18}/>}       tone="amber"   />
        <StatCard label="Expired"           value={data.expiredLibraries} icon={<AlertTriangle size={18}/>} tone="danger" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Revenue"     value={formatCurrency(data.totalRevenue)}   icon={<IndianRupee size={18}/>} tone="teal"   />
        <StatCard label="Monthly Revenue"   value={formatCurrency(data.monthlyRevenue)} icon={<TrendingUp size={18}/>}  tone="success"/>
        <StatCard label="Total Students"    value={data.totalStudents}                  icon={<Users size={18}/>}       tone="info"   />
        <StatCard label="Open Tickets"      value={data.openTickets}                    icon={<LifeBuoy size={18}/>}    tone={data.openTickets>0?"warning":"success"}/>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Library Growth (last 6 months)</CardTitle></CardHeader>
          <CardBody>
            {growthData.length>0
              ? <ComparisonBarChart data={growthData} bars={[{key:"value",color:"#f59e0b"}]}/>
              : <p className="text-sm text-ink-500 text-center py-12">No data</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
          <CardBody>
            {planData.length>0
              ? <DonutChart data={planData}/>
              : <p className="text-sm text-ink-500 text-center py-12">No plan data</p>}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Library Status Distribution</CardTitle></CardHeader>
        <CardBody>
          {statusData.length>0
            ? <ComparisonBarChart data={statusData} bars={[{key:"value",color:"#6366f1"}]}/>
            : <p className="text-sm text-ink-500 text-center py-12">No data</p>}
        </CardBody>
      </Card>

      {/* Ticket summary */}
      {data.ticketStats && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><LifeBuoy size={14}/> Support Ticket Summary</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(data.ticketStats).map(([status,count])=>(
                <div key={status} className="bg-ink-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-ink-100">{count}</p>
                  <p className="text-xs text-ink-400 mt-1">{status.replace("_"," ")}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
