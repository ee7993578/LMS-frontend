import { useState } from "react";
import { Search, Filter, Download, RefreshCw, Users } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { SkeletonRow, EmptyState } from "../../../components/ui/Feedback";
import { formatCurrency, monthIdToLabel } from "../../../utils/format";
import { getStudentFeeReport } from "../../../api/paymentApi";
import { PageHeader, exportCSV, MONTHS, statusTone, MobileCard } from "./reportUtils";

export default function StudentFeeReport() {
  const [fees, setFees]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [month, setMonth]   = useState("");

  const load = () => {
    setLoading(true); setSearched(true);
    const p = {};
    if (month) p.monthId = month;
    if (status !== "ALL") p.status = status;
    if (search) p.search = search;
    getStudentFeeReport(p)
      .then(r => setFees(r.data || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };

  const sel = "w-full sm:w-auto bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400";

  return (
    <div>
      <PageHeader title="Student Fee Report" subtitle="Filter and view fee status per student">
        <Button size="sm" variant="secondary" onClick={() => exportCSV(fees, "student-fee-report.csv")}><Download size={13}/> CSV</Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-ink-900 border border-ink-700 rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-ink-500"/>
              <input className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-9 pr-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400"
                placeholder="Name / Phone / Admission" value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && load()}/>
            </div>
          </div>
          <select className={sel} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
          </select>
          <select className={sel} value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">All Months</option>
            {MONTHS.map(m => <option key={m} value={m}>{monthIdToLabel(m)}</option>)}
          </select>
          <Button onClick={load} loading={loading}><Filter size={13}/> Search</Button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <Card>
          <CardBody>
            <Table>
              <THead><tr><TH>Student</TH><TH>Admission</TH><TH>Phone</TH><TH>Seat</TH><TH>Plan</TH><TH>Month</TH><TH>Monthly Fee</TH><TH>Late Fee</TH><TH>Concession</TH><TH>Paid</TH><TH>Remaining</TH><TH>Status</TH></tr></THead>
              <TBody>
                {loading ? Array.from({length:5}).map((_,i)=><TR key={i}>{Array.from({length:12}).map((_,j)=><TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                : !searched ? <tr><td colSpan={12}><EmptyState icon={<Users size={24}/>} title="Apply filters to search" description="Select month, status or enter student name then click Search."/></td></tr>
                : fees.length===0 ? <tr><td colSpan={12}><EmptyState icon={<Users size={24}/>} title="No records" description="Try different filters."/></td></tr>
                : fees.map(f => (
                  <TR key={f.feeId}>
                    <TD className="font-medium text-ink-100">{f.studentName}</TD>
                    <TD className="text-ink-500 text-xs">{f.admissionNumber||"—"}</TD>
                    <TD className="text-ink-400">{f.phone||"—"}</TD>
                    <TD>{f.seatNumber||"—"}</TD>
                    <TD className="text-xs text-amber-300">{f.plan||"—"}</TD>
                    <TD>{monthIdToLabel(f.monthId)}</TD>
                    <TD>{formatCurrency(f.monthlyFee)}</TD>
                    <TD className={f.lateFee>0?"text-red-400":"text-ink-600"}>{formatCurrency(f.lateFee)}</TD>
                    <TD className={f.concession>0?"text-green-400":"text-ink-600"}>{formatCurrency(f.concession)}</TD>
                    <TD className="text-green-400 font-medium">{formatCurrency(f.paidAmount)}</TD>
                    <TD className={f.remainingAmount>0?"text-red-400 font-semibold":"text-ink-600"}>{formatCurrency(f.remainingAmount)}</TD>
                    <TD><Badge tone={statusTone(f.status)}>{f.status}</Badge></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {!searched && <div className="text-center py-10 text-ink-500 text-sm">Apply filters and click Search</div>}
        {searched && fees.length === 0 && !loading && <div className="text-center py-10 text-ink-500 text-sm">No records found</div>}
        {fees.map(f => (
          <MobileCard key={f.feeId}
            title={f.studentName} subtitle={`${f.seatNumber||"No seat"} • ${monthIdToLabel(f.monthId)}`}
            badge={f.status} badgeTone={statusTone(f.status)}
            rows={[
              { label:"Monthly Fee", value: formatCurrency(f.monthlyFee) },
              { label:"Paid",        value: formatCurrency(f.paidAmount),   color: "text-green-400" },
              { label:"Remaining",   value: formatCurrency(f.remainingAmount), color: f.remainingAmount>0?"text-red-400":"text-ink-500" },
              { label:"Late Fee",    value: formatCurrency(f.lateFee),      color: f.lateFee>0?"text-red-400":"text-ink-500" },
            ]}
          />
        ))}
      </div>
    </div>
  );
}
