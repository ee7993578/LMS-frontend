import { useEffect, useState } from "react";
import { Wallet, Download, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { SkeletonRow, EmptyState } from "../../../components/ui/Feedback";
import { formatCurrency, formatDate, monthIdToLabel } from "../../../utils/format";
import { getPendingDuesReport } from "../../../api/paymentApi";
import { PageHeader, exportCSV, statusTone, MobileCard } from "./reportUtils";

export default function PendingDuesReport() {
  const [dues, setDues]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPendingDuesReport()
      .then(r => setDues(r.data || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Pending Dues" subtitle="Students with outstanding fee balance — sorted by highest amount">
        <Button size="sm" variant="secondary" onClick={() => exportCSV(dues, "pending-dues.csv")}><Download size={13}/> CSV</Button>
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {/* Desktop */}
      <div className="hidden sm:block">
        <Card>
          <CardBody>
            <Table>
              <THead><tr><TH>#</TH><TH>Student</TH><TH>Phone</TH><TH>Seat</TH><TH>Month</TH><TH>Payable</TH><TH>Paid</TH><TH>Pending</TH><TH>Due Date</TH><TH>Overdue</TH><TH>Status</TH></tr></THead>
              <TBody>
                {loading
                  ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:11}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                  : dues.length === 0
                    ? <tr><td colSpan={11}><EmptyState icon={<CheckCircle size={24}/>} title="No pending dues!" description="All students are up to date."/></td></tr>
                    : dues.map((r, i) => (
                      <TR key={`${r.studentId}-${r.monthId}-${i}`}>
                        <TD className="text-ink-500 text-xs">{i + 1}</TD>
                        <TD className="font-medium text-ink-100">{r.studentName}</TD>
                        <TD className="text-ink-400">{r.phone || "—"}</TD>
                        <TD>{r.seatNumber || "—"}</TD>
                        <TD>{monthIdToLabel(r.monthId)}</TD>
                        <TD>{formatCurrency(r.payable)}</TD>
                        <TD className="text-green-400">{formatCurrency(r.paidAmount)}</TD>
                        <TD className="text-red-400 font-semibold">{formatCurrency(r.pendingAmount)}</TD>
                        <TD className="text-ink-400">{formatDate(r.dueDate)}</TD>
                        <TD>{r.daysOverdue > 0 ? <Badge tone="danger">{r.daysOverdue}d overdue</Badge> : <Badge tone="warning">Due soon</Badge>}</TD>
                        <TD><Badge tone={statusTone(r.status)}>{r.status}</Badge></TD>
                      </TR>
                    ))
                }
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading && Array.from({length:4}).map((_,i) => <div key={i} className="h-24 bg-ink-800 rounded-2xl animate-pulse"/>)}
        {!loading && dues.length === 0 && <div className="text-center py-12 text-ink-500 text-sm">No pending dues!</div>}
        {dues.map((r, i) => (
          <MobileCard key={i}
            title={r.studentName}
            subtitle={`Seat: ${r.seatNumber || "—"} • ${monthIdToLabel(r.monthId)}`}
            badge={r.daysOverdue > 0 ? `${r.daysOverdue}d overdue` : "Due soon"}
            badgeTone={r.daysOverdue > 0 ? "danger" : "warning"}
            rows={[
              { label: "Payable",  value: formatCurrency(r.payable) },
              { label: "Paid",     value: formatCurrency(r.paidAmount),    color: "text-green-400" },
              { label: "Pending",  value: formatCurrency(r.pendingAmount), color: "text-red-400" },
              { label: "Due Date", value: formatDate(r.dueDate) },
            ]}
          />
        ))}
      </div>
    </div>
  );
}
