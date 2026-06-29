import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import StatCard from "../../../components/ui/StatCard";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { SkeletonCard, EmptyState } from "../../../components/ui/Feedback";
import { formatCurrency, formatDate } from "../../../utils/format";
import { getDefaultersReport } from "../../../api/paymentApi";
import { PageHeader, statusTone, MobileCard } from "./reportUtils";

const BUCKETS = [
  { key: "days30", label: "30-Day Defaulters",  dot: "bg-yellow-400", tone: "warning" },
  { key: "days60", label: "60-Day Defaulters",  dot: "bg-orange-500", tone: "danger"  },
  { key: "days90", label: "90+ Day Defaulters", dot: "bg-red-600",    tone: "danger"  },
];

function DefaulterTable({ rows, loading }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block">
        <Table>
          <THead><tr><TH>Student</TH><TH>Phone</TH><TH>Seat</TH><TH>Pending</TH><TH>Due Date</TH><TH>Days Overdue</TH><TH>Status</TH></tr></THead>
          <TBody>
            {loading ? Array.from({length:3}).map((_,i) => <TR key={i}>{Array.from({length:7}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
            : rows.length === 0 ? <tr><td colSpan={7}><p className="text-sm text-ink-500 text-center py-4">No defaulters in this bucket</p></td></tr>
            : rows.map((r, i) => (
              <TR key={i}>
                <TD className="font-medium text-ink-100">{r.studentName}</TD>
                <TD className="text-ink-400">{r.phone || "—"}</TD>
                <TD>{r.seatNumber || "—"}</TD>
                <TD className="text-red-400 font-semibold">{formatCurrency(r.pendingAmount)}</TD>
                <TD className="text-ink-400">{formatDate(r.dueDate)}</TD>
                <TD><Badge tone="danger">{r.daysOverdue}d</Badge></TD>
                <TD><Badge tone={statusTone(r.status)}>{r.status}</Badge></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-2">
        {rows.map((r, i) => (
          <MobileCard key={i}
            title={r.studentName} subtitle={`Seat: ${r.seatNumber || "—"}`}
            badge={`${r.daysOverdue}d overdue`} badgeTone="danger"
            rows={[
              { label: "Pending",  value: formatCurrency(r.pendingAmount), color: "text-red-400" },
              { label: "Due Date", value: formatDate(r.dueDate) },
              { label: "Status",   value: r.status },
            ]}
          />
        ))}
        {rows.length === 0 && <p className="text-sm text-ink-500 text-center py-3">No defaulters</p>}
      </div>
    </>
  );
}

export default function DefaultersReport() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDefaultersReport()
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Defaulters Report" subtitle="Students who haven't paid — grouped by overdue duration">
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {loading && !data
        ? <div className="grid sm:grid-cols-3 gap-4">{[1,2,3].map(i => <SkeletonCard key={i}/>)}</div>
        : data && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {BUCKETS.map(b => (
                <StatCard key={b.key} label={b.label} value={data[b.key]?.length || 0}
                  icon={<AlertTriangle size={16}/>} tone={b.tone}/>
              ))}
            </div>

            {BUCKETS.map(b => (
              <Card key={b.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${b.dot}`}/>
                    {b.label} ({data[b.key]?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <DefaulterTable rows={data[b.key] || []} loading={false}/>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}
