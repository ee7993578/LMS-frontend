import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Wallet, Users, AlertCircle, RefreshCw, Download } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../../components/ui/Card";
import { RevenueAreaChart, ComparisonBarChart } from "../../../components/charts/Charts";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StatCard from "../../../components/ui/StatCard";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { SkeletonCard, EmptyState } from "../../../components/ui/Feedback";
import { formatCurrency, monthIdToLabel } from "../../../utils/format";
import { getMonthlyCollectionReport } from "../../../api/paymentApi";
import { getSubscriptionExpiryReport } from "../../../api/libraryAdminApi";
import { PageHeader, exportCSV } from "./reportUtils";

export default function ReportDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMonthlyCollectionReport()
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const revenueData = (data?.months || []).map(m => ({ label: monthIdToLabel(m.monthId), value: m.collectedAmount }));

  return (
    <div>
      <PageHeader title="Fee Reports Dashboard" subtitle="Overall fee collection summary">
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i}/>)}</div>
      ) : data ? (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Total Expected"    value={formatCurrency(data.totalExpected)}    icon={<IndianRupee size={18}/>} tone="info"   />
            <StatCard label="Total Collected"   value={formatCurrency(data.totalCollected)}   icon={<TrendingUp size={18}/>}  tone="teal"   />
            <StatCard label="Total Pending"     value={formatCurrency(data.totalPending)}     icon={<Wallet size={18}/>}      tone="danger"  />
            <StatCard label="Today's Collection" value={formatCurrency(data.todayCollection)} icon={<IndianRupee size={18}/>} tone="amber"  />
            <StatCard label="Overdue Students"  value={data.overdueStudents}                  icon={<AlertCircle size={18}/>} tone="danger"  />
            <StatCard label="Active Students"   value={data.activeStudents}                   icon={<Users size={18}/>}       tone="info"   />
          </div>

          {/* Revenue chart */}
          {revenueData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Monthly Collection Trend</CardTitle></CardHeader>
              <CardBody><RevenueAreaChart data={revenueData}/></CardBody>
            </Card>
          )}

          {/* Monthly table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Month-wise Summary</CardTitle>
              <Button size="sm" variant="secondary" onClick={() => exportCSV(data.months || [], "monthly-summary.csv")}>
                <Download size={13}/> CSV
              </Button>
            </CardHeader>
            <CardBody>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <Table>
                  <THead><tr><TH>Month</TH><TH>Expected</TH><TH>Collected</TH><TH>Pending</TH><TH>%</TH><TH>Paid</TH><TH>Partial</TH><TH>Unpaid</TH></tr></THead>
                  <TBody>
                    {(data.months||[]).map(m => (
                      <TR key={m.monthId}>
                        <TD className="font-medium text-ink-100">{monthIdToLabel(m.monthId)}</TD>
                        <TD>{formatCurrency(m.expectedCollection)}</TD>
                        <TD className="text-green-400 font-semibold">{formatCurrency(m.collectedAmount)}</TD>
                        <TD className="text-red-400">{formatCurrency(m.pendingAmount)}</TD>
                        <TD>
                          <div className="flex items-center gap-2">
                            <div className="w-14 bg-ink-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${m.collectionPct>=90?"bg-green-400":m.collectionPct>=60?"bg-amber-400":"bg-red-400"}`} style={{width:`${Math.min(100,m.collectionPct)}%`}}/>
                            </div>
                            <span className="text-xs">{m.collectionPct}%</span>
                          </div>
                        </TD>
                        <TD><Badge tone="success">{m.paidCount}</Badge></TD>
                        <TD><Badge tone="warning">{m.partialCount}</Badge></TD>
                        <TD><Badge tone="danger">{m.unpaidCount}</Badge></TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {(data.months||[]).map(m => (
                  <div key={m.monthId} className="bg-ink-800 border border-ink-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-ink-100">{monthIdToLabel(m.monthId)}</p>
                      <span className="text-xs font-bold text-amber-300">{m.collectionPct}% collected</span>
                    </div>
                    <div className="w-full bg-ink-700 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${m.collectionPct>=90?"bg-green-400":m.collectionPct>=60?"bg-amber-400":"bg-red-400"}`} style={{width:`${Math.min(100,m.collectionPct)}%`}}/>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><p className="text-ink-600">Expected</p><p className="font-medium text-ink-300">{formatCurrency(m.expectedCollection)}</p></div>
                      <div><p className="text-ink-600">Collected</p><p className="font-medium text-green-400">{formatCurrency(m.collectedAmount)}</p></div>
                      <div><p className="text-ink-600">Pending</p><p className="font-medium text-red-400">{formatCurrency(m.pendingAmount)}</p></div>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-ink-700">
                      <Badge tone="success">Paid: {m.paidCount}</Badge>
                      <Badge tone="warning">Partial: {m.partialCount}</Badge>
                      <Badge tone="danger">Unpaid: {m.unpaidCount}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card><EmptyState icon={<IndianRupee size={24}/>} title="No data" description="No fee records found."/></Card>
      )}
    </div>
  );
}
