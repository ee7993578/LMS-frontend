import { useEffect, useState } from "react";
import { History, Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { EmptyState } from "../../../components/ui/Feedback";
import { getAuditLog } from "../../../api/paymentApi";
import { PageHeader, exportCSV } from "./reportUtils";

export default function AuditLogReport() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAuditLog()
      .then(r => setLogs(r.data || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const actionTone = (a) => {
    if (!a) return "info";
    if (a.includes("REJECT")) return "danger";
    if (a.includes("VERIFY") || a.includes("APPROVE")) return "success";
    if (a.includes("LATE") || a.includes("OVERDUE")) return "warning";
    return "info";
  };

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Complete trail of all fee-related admin actions">
        <Button size="sm" variant="secondary" onClick={() => exportCSV(logs, "audit-log.csv")}><Download size={13}/> CSV</Button>
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {/* Desktop */}
      <div className="hidden sm:block">
        <Card>
          <CardBody>
            <Table>
              <THead><tr><TH>Time</TH><TH>Admin</TH><TH>Student</TH><TH>Action</TH><TH>Details</TH></tr></THead>
              <TBody>
                {loading
                  ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:5}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                  : logs.length === 0
                    ? <tr><td colSpan={5}><EmptyState icon={<History size={24}/>} title="No audit logs" description="Admin actions will appear here."/></td></tr>
                    : logs.map(a => (
                      <TR key={a.id}>
                        <TD className="text-ink-400 text-xs whitespace-nowrap">{new Date(a.performedAt).toLocaleString("en-IN")}</TD>
                        <TD className="font-medium text-ink-100 text-sm">{a.performedBy}</TD>
                        <TD className="text-ink-300">{a.studentName || "—"}</TD>
                        <TD><Badge tone={actionTone(a.action)}>{a.action}</Badge></TD>
                        <TD className="text-xs text-ink-400 max-w-xs truncate" title={a.details}>{a.details}</TD>
                      </TR>
                    ))
                }
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Mobile timeline */}
      <div className="sm:hidden space-y-3">
        {loading && Array.from({length:4}).map((_,i) => <div key={i} className="h-20 bg-ink-800 rounded-2xl animate-pulse"/>)}
        {!loading && logs.length === 0 && <div className="text-center py-12 text-ink-500 text-sm">No audit logs yet</div>}
        {logs.map(a => (
          <div key={a.id} className="bg-ink-800 border border-ink-700 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-semibold text-ink-100">{a.performedBy}</p>
                <p className="text-xs text-ink-500 mt-0.5">{new Date(a.performedAt).toLocaleString("en-IN")}</p>
              </div>
              <Badge tone={actionTone(a.action)}>{a.action}</Badge>
            </div>
            {a.studentName && <p className="text-xs text-ink-400">Student: {a.studentName}</p>}
            {a.details && <p className="text-xs text-ink-500 mt-1 line-clamp-2">{a.details}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
