import { useEffect, useState } from "react";
import {
  FileBarChart, Download, AlertTriangle, Clock, CheckCircle, Users, IndianRupee,
  Wallet, Receipt, BookOpen, Search, Filter, RefreshCw, History,
  TrendingUp, AlertCircle, Hash
} from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { RevenueAreaChart, ComparisonBarChart, DonutChart } from "../../components/charts/Charts";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { SkeletonCard, SkeletonRow, EmptyState } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";
import {
  getMonthlyCollectionReport, getStudentFeeReport, getPendingDuesReport,
  getDefaultersReport, getLibraryReceipts, getReceiptById,
  getStudentLedger, getAuditLog
} from "../../api/paymentApi";
import { getAttendanceByDateRange } from "../../api/attendanceApi";
import { getAllStudents, getAllPlans, getSubscriptionExpiryReport } from "../../api/libraryAdminApi";
import { getAllSeats } from "../../api/seatApi";
import ReceiptCard from "../../components/fee/ReceiptCard";

const TABS = [
  { id: "dashboard",   label: "Dashboard" },
  { id: "monthly",     label: "Monthly Collection" },
  { id: "student-fee", label: "Student Fee Report" },
  { id: "pending-dues",label: "Pending Dues" },
  { id: "defaulters",  label: "Defaulters" },
  { id: "receipts",    label: "Receipts" },
  { id: "ledger",      label: "Fee Ledger" },
  { id: "audit-log",   label: "Audit Log" },
  { id: "attendance",  label: "Attendance" },
  { id: "revenue",     label: "Revenue Chart" },
];

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

function statusTone(s) {
  if (s === "PAID") return "success";
  if (s === "PARTIAL") return "warning";
  return "danger";
}

function exportCSV(data, filename) {
  if (!data || !data.length) { toast.error("No data to export"); return; }
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","));
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function daysBadge(days, type) {
  if (type === "ago") {
    if (days === 0) return <Badge tone="danger">Today</Badge>;
    if (days === 1) return <Badge tone="danger">Yesterday</Badge>;
    return <Badge tone="danger">{days}d ago</Badge>;
  }
  if (days === 0) return <Badge tone="warning">Expires Today</Badge>;
  if (days === 1) return <Badge tone="warning">Tomorrow</Badge>;
  return <Badge tone="warning">In {days}d</Badge>;
}

export default function Reports() {
  const [tab, setTab] = useState("dashboard");

  /* ---- shared data ---- */
  const [students, setStudents] = useState([]);
  const [plans,    setPlans]    = useState([]);
  const [seats,    setSeats]    = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [subReport, setSubReport] = useState(null);

  /* ---- per-tab data ---- */
  const [monthly,     setMonthly]     = useState(null);
  const [monthlyLoad, setMonthlyLoad] = useState(false);
  const [sfFees,      setSfFees]      = useState([]);
  const [sfLoad,      setSfLoad]      = useState(false);
  const [sfSearch,    setSfSearch]    = useState("");
  const [sfStatus,    setSfStatus]    = useState("ALL");
  const [sfMonth,     setSfMonth]     = useState("");
  const [pendingDues, setPendingDues] = useState([]);
  const [pdLoad,      setPdLoad]      = useState(false);
  const [defaulters,  setDefaulters]  = useState(null);
  const [defLoad,     setDefLoad]     = useState(false);
  const [receipts,    setReceipts]    = useState([]);
  const [rcptLoad,    setRcptLoad]    = useState(false);
  const [rcptSearch,  setRcptSearch]  = useState("");
  const [viewReceipt, setViewReceipt] = useState(null);
  const [ledgerSid,   setLedgerSid]   = useState("");
  const [ledger,      setLedger]      = useState(null);
  const [ledgerLoad,  setLedgerLoad]  = useState(false);
  const [auditLog,    setAuditLog]    = useState([]);
  const [auditLoad,   setAuditLoad]   = useState(false);

  /* ---- loaders ---- */
  const loadMonthly    = () => { setMonthlyLoad(true); getMonthlyCollectionReport().then(r => setMonthly(r.data)).catch(() => toast.error("Monthly report failed")).finally(() => setMonthlyLoad(false)); };
  const loadSfFees     = () => { setSfLoad(true); const p = {}; if (sfMonth) p.monthId = sfMonth; if (sfStatus !== "ALL") p.status = sfStatus; if (sfSearch) p.search = sfSearch; getStudentFeeReport(p).then(r => setSfFees(r.data || [])).catch(() => toast.error("Fee report failed")).finally(() => setSfLoad(false)); };
  const loadPending    = () => { setPdLoad(true); getPendingDuesReport().then(r => setPendingDues(r.data || [])).catch(() => toast.error("Pending dues failed")).finally(() => setPdLoad(false)); };
  const loadDefaulters = () => { setDefLoad(true); getDefaultersReport().then(r => setDefaulters(r.data)).catch(() => toast.error("Defaulters failed")).finally(() => setDefLoad(false)); };
  const loadReceipts   = () => { setRcptLoad(true); getLibraryReceipts().then(r => setReceipts(r.data || [])).catch(() => toast.error("Receipts failed")).finally(() => setRcptLoad(false)); };
  const loadLedger     = () => { if (!ledgerSid) return; setLedgerLoad(true); getStudentLedger(ledgerSid).then(r => setLedger(r.data)).catch(() => toast.error("Ledger failed")).finally(() => setLedgerLoad(false)); };
  const loadAudit      = () => { setAuditLoad(true); getAuditLog().then(r => setAuditLog(r.data || [])).catch(() => toast.error("Audit log failed")).finally(() => setAuditLoad(false)); };

  useEffect(() => {
    loadMonthly();
    const today = new Date().toISOString().split("T")[0];
    Promise.allSettled([
      getAttendanceByDateRange(getLast7Days()[0], today),
      getAllStudents(), getAllPlans(), getAllSeats(),
      getSubscriptionExpiryReport(),
    ]).then(([attR, stuR, planR, seatR, subR]) => {
      if (attR.status === "fulfilled") {
        const byDate = {};
        (attR.value.data || []).forEach(r => { byDate[r.attendanceDate] = (byDate[r.attendanceDate] || 0) + 1; });
        setAttendanceData(getLast7Days().map(d => ({ label: new Date(d).toLocaleDateString("en-IN", { weekday: "short" }), value: byDate[d] || 0 })));
      }
      if (stuR.status  === "fulfilled") setStudents(stuR.value.data  || []);
      if (planR.status === "fulfilled") setPlans(planR.value.data || []);
      if (seatR.status === "fulfilled") setSeats(seatR.value.data || []);
      if (subR.status  === "fulfilled") setSubReport(subR.value.data);
    });
  }, []);

  useEffect(() => {
    if (tab === "student-fee") loadSfFees();
    if (tab === "pending-dues") loadPending();
    if (tab === "defaulters") loadDefaulters();
    if (tab === "receipts") loadReceipts();
    if (tab === "audit-log") loadAudit();
  }, [tab]);

  const openReceipt = id => getReceiptById(id).then(r => setViewReceipt(r.data)).catch(() => toast.error("Couldn't load receipt"));

  /* ---- chart derivations ---- */
  const revenueData = (monthly?.months || []).map(m => ({ label: monthIdToLabel(m.monthId), value: m.collectedAmount }));
  const planCount   = {};
  students.forEach(s => { const n = s.plan?.name || "No plan"; planCount[n] = (planCount[n] || 0) + 1; });
  const planDistrib  = Object.entries(planCount).map(([name, value]) => ({ name, value }));
  const seatByLoc    = {};
  seats.forEach(s => { const l = s.location || "Other"; if (!seatByLoc[l]) seatByLoc[l] = { label: l, occupied: 0, available: 0 }; if (s.status === "ALLOCATED") seatByLoc[l].occupied++; else seatByLoc[l].available++; });

  const filteredRcpt = receipts.filter(r => !rcptSearch || r.studentName?.toLowerCase().includes(rcptSearch.toLowerCase()) || r.receiptNumber?.toLowerCase().includes(rcptSearch.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Reports &amp; Analytics</h2>
          <p className="text-sm text-ink-400 mt-0.5">Fee collection, receipts, defaulters, ledger and audit logs</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 overflow-x-auto no-scrollbar border-b border-ink-700 pb-px">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-amber-400 text-amber-300" : "border-transparent text-ink-400 hover:text-ink-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ DASHBOARD ═══════════════ */}
      {tab === "dashboard" && (
        <div className="space-y-5">
          {monthlyLoad
            ? <div className="grid sm:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}</div>
            : monthly && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard label="Total Expected"    value={formatCurrency(monthly.totalExpected)}    icon={<IndianRupee size={18}/>} tone="info"    />
                  <StatCard label="Total Collected"   value={formatCurrency(monthly.totalCollected)}   icon={<TrendingUp size={18}/>}  tone="teal"    />
                  <StatCard label="Total Pending"     value={formatCurrency(monthly.totalPending)}     icon={<Wallet size={18}/>}      tone="danger"  />
                  <StatCard label="Today's Collection" value={formatCurrency(monthly.todayCollection)} icon={<IndianRupee size={18}/>} tone="amber"   />
                  <StatCard label="Overdue Students"  value={monthly.overdueStudents}                  icon={<AlertCircle size={18}/>} tone="danger"  />
                  <StatCard label="Active Students"   value={monthly.activeStudents}                   icon={<Users size={18}/>}       tone="info"    />
                </div>

                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Monthly Collection Summary</CardTitle>
                    <Button size="sm" variant="secondary" onClick={() => exportCSV(monthly.months || [], "monthly-collection.csv")}><Download size={13}/> Export CSV</Button>
                  </CardHeader>
                  <CardBody>
                    <Table>
                      <THead><tr><TH>Month</TH><TH>Expected</TH><TH>Collected</TH><TH>Pending</TH><TH>Collection %</TH><TH>Paid</TH><TH>Partial</TH><TH>Unpaid</TH></tr></THead>
                      <TBody>
                        {(monthly.months || []).length === 0
                          ? <tr><td colSpan={8}><EmptyState icon={<IndianRupee size={22}/>} title="No fee data" description="No fee records found." /></td></tr>
                          : (monthly.months || []).map(m => (
                            <TR key={m.monthId}>
                              <TD className="font-medium text-ink-100">{monthIdToLabel(m.monthId)}</TD>
                              <TD>{formatCurrency(m.expectedCollection)}</TD>
                              <TD className="text-green-400 font-semibold">{formatCurrency(m.collectedAmount)}</TD>
                              <TD className="text-red-400">{formatCurrency(m.pendingAmount)}</TD>
                              <TD>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-ink-700 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${m.collectionPct >= 90 ? "bg-green-400" : m.collectionPct >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(100, m.collectionPct)}%` }}/>
                                  </div>
                                  <span className="text-xs">{m.collectionPct}%</span>
                                </div>
                              </TD>
                              <TD><Badge tone="success">{m.paidCount}</Badge></TD>
                              <TD><Badge tone="warning">{m.partialCount}</Badge></TD>
                              <TD><Badge tone="danger">{m.unpaidCount}</Badge></TD>
                            </TR>
                          ))
                        }
                      </TBody>
                    </Table>
                  </CardBody>
                </Card>

                {subReport && (subReport.expiredCount > 0 || subReport.expiringSoonCount > 0) && (
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400"/> Subscription Alerts</CardTitle></CardHeader>
                    <CardBody className="grid sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-center justify-between">
                        <p className="text-sm text-ink-200">Already Expired</p>
                        <Badge tone="danger">{subReport.expiredCount} students</Badge>
                      </div>
                      <div className="rounded-xl bg-amber-400/10 border border-amber-400/20 p-3 flex items-center justify-between">
                        <p className="text-sm text-ink-200">Expiring in 7 days</p>
                        <Badge tone="warning">{subReport.expiringSoonCount} students</Badge>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </>
            )
          }
        </div>
      )}

      {/* ═══════════════ MONTHLY COLLECTION ═══════════════ */}
      {tab === "monthly" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={loadMonthly} loading={monthlyLoad}><RefreshCw size={13}/> Refresh</Button>
            <Button size="sm" variant="secondary" onClick={() => exportCSV(monthly?.months || [], "monthly-collection.csv")}><Download size={13}/> CSV</Button>
          </div>
          {monthlyLoad ? <SkeletonCard/> : monthly && (
            <Card>
              <CardHeader><CardTitle>Monthly Collection Report</CardTitle></CardHeader>
              <CardBody>
                <Table>
                  <THead><tr><TH>Month</TH><TH>Expected</TH><TH>Collected</TH><TH>Pending</TH><TH>%</TH><TH>Students</TH><TH>Paid</TH><TH>Partial</TH><TH>Unpaid</TH></tr></THead>
                  <TBody>
                    {(monthly.months || []).map(m => (
                      <TR key={m.monthId}>
                        <TD className="font-medium text-ink-100">{monthIdToLabel(m.monthId)}</TD>
                        <TD>{formatCurrency(m.expectedCollection)}</TD>
                        <TD className="text-green-400 font-semibold">{formatCurrency(m.collectedAmount)}</TD>
                        <TD className="text-red-400">{formatCurrency(m.pendingAmount)}</TD>
                        <TD>
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 bg-ink-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${m.collectionPct >= 90 ? "bg-green-400" : m.collectionPct >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${Math.min(100, m.collectionPct)}%` }}/>
                            </div>
                            <span className="text-xs font-medium">{m.collectionPct}%</span>
                          </div>
                        </TD>
                        <TD className="text-ink-400">{m.totalStudents}</TD>
                        <TD><Badge tone="success">{m.paidCount}</Badge></TD>
                        <TD><Badge tone="warning">{m.partialCount}</Badge></TD>
                        <TD><Badge tone="danger">{m.unpaidCount}</Badge></TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════ STUDENT FEE REPORT ═══════════════ */}
      {tab === "student-fee" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input className="flex-1 min-w-[180px] max-w-xs bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400"
              placeholder="Name / Phone / Admission No." value={sfSearch} onChange={e => setSfSearch(e.target.value)}/>
            <select className="bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400" value={sfStatus} onChange={e => setSfStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>
            <select className="bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400" value={sfMonth} onChange={e => setSfMonth(e.target.value)}>
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m} value={m}>{monthIdToLabel(m)}</option>)}
            </select>
            <Button size="sm" onClick={loadSfFees} loading={sfLoad}><Filter size={13}/> Apply</Button>
            <Button size="sm" variant="secondary" onClick={() => exportCSV(sfFees, "student-fee-report.csv")}><Download size={13}/> CSV</Button>
          </div>
          <Card>
            <CardBody>
              <Table>
                <THead><tr><TH>Student</TH><TH>Admission</TH><TH>Phone</TH><TH>Seat</TH><TH>Plan</TH><TH>Month</TH><TH>Monthly Fee</TH><TH>Late Fee</TH><TH>Concession</TH><TH>Paid</TH><TH>Remaining</TH><TH>Status</TH></tr></THead>
                <TBody>
                  {sfLoad
                    ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:12}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                    : sfFees.length === 0
                      ? <tr><td colSpan={12}><EmptyState icon={<Users size={24}/>} title="No records" description="Try adjusting filters."/></td></tr>
                      : sfFees.map(f => (
                        <TR key={f.feeId}>
                          <TD className="font-medium text-ink-100">{f.studentName}</TD>
                          <TD className="text-ink-400 text-xs">{f.admissionNumber || "—"}</TD>
                          <TD className="text-ink-300">{f.phone || "—"}</TD>
                          <TD className="text-ink-300">{f.seatNumber || "—"}</TD>
                          <TD className="text-amber-300 text-xs">{f.plan || "—"}</TD>
                          <TD>{monthIdToLabel(f.monthId)}</TD>
                          <TD>{formatCurrency(f.monthlyFee)}</TD>
                          <TD className={f.lateFee > 0 ? "text-red-400" : "text-ink-500"}>{formatCurrency(f.lateFee)}</TD>
                          <TD className={f.concession > 0 ? "text-green-400" : "text-ink-500"}>{formatCurrency(f.concession)}</TD>
                          <TD className="text-green-400 font-medium">{formatCurrency(f.paidAmount)}</TD>
                          <TD className={f.remainingAmount > 0 ? "text-red-400 font-semibold" : "text-ink-500"}>{formatCurrency(f.remainingAmount)}</TD>
                          <TD><Badge tone={statusTone(f.status)}>{f.status}</Badge></TD>
                        </TR>
                      ))
                  }
                </TBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ═══════════════ PENDING DUES ═══════════════ */}
      {tab === "pending-dues" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => exportCSV(pendingDues, "pending-dues.csv")}><Download size={13}/> CSV</Button>
            <Button size="sm" variant="secondary" onClick={loadPending} loading={pdLoad}><RefreshCw size={13}/> Refresh</Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wallet size={14} className="text-red-400"/> Pending Dues — sorted by highest amount</CardTitle></CardHeader>
            <CardBody>
              <Table>
                <THead><tr><TH>#</TH><TH>Student</TH><TH>Phone</TH><TH>Seat</TH><TH>Month</TH><TH>Payable</TH><TH>Paid</TH><TH>Pending</TH><TH>Due Date</TH><TH>Days Overdue</TH><TH>Status</TH></tr></THead>
                <TBody>
                  {pdLoad
                    ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:11}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                    : pendingDues.length === 0
                      ? <tr><td colSpan={11}><EmptyState icon={<CheckCircle size={24}/>} title="No pending dues" description="All students are up to date!"/></td></tr>
                      : pendingDues.map((r, i) => (
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
      )}

      {/* ═══════════════ DEFAULTERS ═══════════════ */}
      {tab === "defaulters" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={loadDefaulters} loading={defLoad}><RefreshCw size={13}/> Refresh</Button>
          </div>
          {defLoad ? <SkeletonCard/> : defaulters && (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <StatCard label="30-Day Defaulters"  value={defaulters.days30?.length || 0} icon={<AlertTriangle size={16}/>} tone="warning"/>
                <StatCard label="60-Day Defaulters"  value={defaulters.days60?.length || 0} icon={<AlertTriangle size={16}/>} tone="danger"/>
                <StatCard label="90+ Day Defaulters" value={defaulters.days90?.length || 0} icon={<AlertTriangle size={16}/>} tone="danger"/>
              </div>
              {[
                { key: "days30", label: "30-Day Defaulters",  dot: "bg-yellow-400" },
                { key: "days60", label: "60-Day Defaulters",  dot: "bg-orange-500" },
                { key: "days90", label: "90+ Day Defaulters", dot: "bg-red-600"    },
              ].map(bucket => (
                <Card key={bucket.key}>
                  <CardHeader><CardTitle className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${bucket.dot}`}/>{bucket.label}</CardTitle></CardHeader>
                  <CardBody>
                    <Table>
                      <THead><tr><TH>Student</TH><TH>Phone</TH><TH>Seat</TH><TH>Pending</TH><TH>Due Date</TH><TH>Days Overdue</TH><TH>Status</TH></tr></THead>
                      <TBody>
                        {(defaulters[bucket.key] || []).length === 0
                          ? <tr><td colSpan={7}><p className="text-sm text-ink-400 text-center py-4">No defaulters in this bucket.</p></td></tr>
                          : (defaulters[bucket.key] || []).map((r, i) => (
                            <TR key={i}>
                              <TD className="font-medium text-ink-100">{r.studentName}</TD>
                              <TD className="text-ink-400">{r.phone || "—"}</TD>
                              <TD>{r.seatNumber || "—"}</TD>
                              <TD className="text-red-400 font-semibold">{formatCurrency(r.pendingAmount)}</TD>
                              <TD className="text-ink-400">{formatDate(r.dueDate)}</TD>
                              <TD><Badge tone="danger">{r.daysOverdue}d</Badge></TD>
                              <TD><Badge tone={statusTone(r.status)}>{r.status}</Badge></TD>
                            </TR>
                          ))
                        }
                      </TBody>
                    </Table>
                  </CardBody>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* ═══════════════ RECEIPTS ═══════════════ */}
      {tab === "receipts" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <input className="flex-1 min-w-[200px] max-w-xs bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400"
              placeholder="Search student or receipt no." value={rcptSearch} onChange={e => setRcptSearch(e.target.value)}/>
            <Button size="sm" variant="secondary" onClick={loadReceipts} loading={rcptLoad}><RefreshCw size={13}/> Refresh</Button>
          </div>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>All Receipts ({filteredRcpt.length})</CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <THead><tr><TH>Receipt No.</TH><TH>Student</TH><TH>Month</TH><TH>Amount Paid</TH><TH>Balance After</TH><TH>Mode</TH><TH>Date</TH><TH className="text-right">Action</TH></tr></THead>
                <TBody>
                  {rcptLoad
                    ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:8}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                    : filteredRcpt.length === 0
                      ? <tr><td colSpan={8}><EmptyState icon={<Receipt size={24}/>} title="No receipts" description="Receipts appear after payment verification."/></td></tr>
                      : filteredRcpt.map(r => (
                        <TR key={r.id}>
                          <TD className="text-amber-300 font-mono text-xs font-semibold">
                            <span className="flex items-center gap-1"><Hash size={11}/>{r.receiptNumber}</span>
                          </TD>
                          <TD className="font-medium text-ink-100">{r.studentName}</TD>
                          <TD>{monthIdToLabel(r.monthId)}</TD>
                          <TD className="text-green-400 font-semibold">{formatCurrency(r.amountPaid)}</TD>
                          <TD><Badge tone={r.balanceAfter > 0 ? "danger" : "success"}>{formatCurrency(r.balanceAfter)}</Badge></TD>
                          <TD className="text-ink-400 text-xs">{r.paymentMode || "—"}</TD>
                          <TD className="text-ink-400">{formatDate(r.paymentDate)}</TD>
                          <TD className="text-right">
                            <Button size="sm" variant="secondary" onClick={() => openReceipt(r.id)}><Receipt size={13}/> View</Button>
                          </TD>
                        </TR>
                      ))
                  }
                </TBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ═══════════════ FEE LEDGER ═══════════════ */}
      {tab === "ledger" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Student Fee Ledger</CardTitle></CardHeader>
            <CardBody>
              <div className="flex gap-2 flex-wrap items-end">
                <select className="flex-1 min-w-[200px] max-w-xs bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
                  value={ledgerSid} onChange={e => setLedgerSid(e.target.value)}>
                  <option value="">Select Student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName}{s.seat ? ` (Seat ${s.seat.seatName})` : ""}</option>)}
                </select>
                <Button onClick={loadLedger} disabled={!ledgerSid} loading={ledgerLoad}>View Ledger</Button>
              </div>
            </CardBody>
          </Card>

          {ledger && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Ledger — {students.find(s => String(s.id) === String(ledgerSid))?.fullName}</CardTitle>
                <Button size="sm" variant="secondary" onClick={() => exportCSV(ledger.entries || [], "fee-ledger.csv")}><Download size={13}/> CSV</Button>
              </CardHeader>
              <CardBody>
                <Table>
                  <THead><tr><TH>Date</TH><TH>Description</TH><TH className="text-right">Debit (₹)</TH><TH className="text-right">Credit (₹)</TH><TH className="text-right">Balance (₹)</TH></tr></THead>
                  <TBody>
                    {(ledger.entries || []).map((e, i) => (
                      <TR key={i}>
                        <TD className="text-ink-400 text-sm">{formatDate(e.date)}</TD>
                        <TD className="text-ink-200">{e.description}</TD>
                        <TD className="text-right">{e.debit > 0 ? <span className="text-red-400 font-medium">{formatCurrency(e.debit)}</span> : <span className="text-ink-600">—</span>}</TD>
                        <TD className="text-right">{e.credit > 0 ? <span className="text-green-400 font-medium">{formatCurrency(e.credit)}</span> : <span className="text-ink-600">—</span>}</TD>
                        <TD className="text-right font-semibold text-ink-100">{formatCurrency(e.balance)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
                <div className="flex justify-end mt-4 pt-3 border-t border-ink-700">
                  <div className="text-right">
                    <p className="text-xs text-ink-500 mb-1">Current Balance</p>
                    <p className={`text-2xl font-display font-bold ${ledger.currentBalance > 0 ? "text-red-400" : "text-green-400"}`}>
                      {formatCurrency(ledger.currentBalance)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ═══════════════ AUDIT LOG ═══════════════ */}
      {tab === "audit-log" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => exportCSV(auditLog, "audit-log.csv")}><Download size={13}/> CSV</Button>
            <Button size="sm" variant="secondary" onClick={loadAudit} loading={auditLoad}><RefreshCw size={13}/> Refresh</Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><History size={14}/> Fee Audit Log</CardTitle></CardHeader>
            <CardBody>
              <Table>
                <THead><tr><TH>Time</TH><TH>Admin</TH><TH>Student</TH><TH>Action</TH><TH>Details</TH></tr></THead>
                <TBody>
                  {auditLoad
                    ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:5}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                    : auditLog.length === 0
                      ? <tr><td colSpan={5}><EmptyState icon={<History size={24}/>} title="No audit logs" description="Actions will be logged here."/></td></tr>
                      : auditLog.map(a => (
                        <TR key={a.id}>
                          <TD className="text-ink-400 text-xs whitespace-nowrap">{new Date(a.performedAt).toLocaleString("en-IN")}</TD>
                          <TD className="font-medium text-ink-100 text-sm">{a.performedBy}</TD>
                          <TD className="text-ink-300">{a.studentName || "—"}</TD>
                          <TD><Badge tone={a.action?.includes("REJECT") ? "danger" : a.action?.includes("VERIFY") ? "success" : "info"}>{a.action}</Badge></TD>
                          <TD className="text-xs text-ink-400 max-w-xs truncate" title={a.details}>{a.details}</TD>
                        </TR>
                      ))
                  }
                </TBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ═══════════════ ATTENDANCE ═══════════════ */}
      {tab === "attendance" && (
        <Card>
          <CardHeader><CardTitle>Attendance — last 7 days</CardTitle></CardHeader>
          <CardBody>
            {attendanceData.length > 0
              ? <ComparisonBarChart data={attendanceData} bars={[{ key: "value", color: "#6366f1" }]}/>
              : <p className="text-sm text-ink-400 text-center py-16">No attendance data for the past 7 days.</p>}
          </CardBody>
        </Card>
      )}

      {/* ═══════════════ REVENUE CHART ═══════════════ */}
      {tab === "revenue" && (
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Revenue by month</CardTitle></CardHeader>
            <CardBody>
              {revenueData.length > 0
                ? <RevenueAreaChart data={revenueData}/>
                : <p className="text-sm text-ink-400 text-center py-16">No fee collections recorded yet.</p>}
            </CardBody>
          </Card>
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader><CardTitle>Plan distribution</CardTitle></CardHeader>
              <CardBody>
                {planDistrib.length > 0
                  ? <DonutChart data={planDistrib}/>
                  : <p className="text-sm text-ink-400 text-center py-12">No students assigned to plans yet.</p>}
              </CardBody>
            </Card>
            <Card>
              <CardHeader><CardTitle>Seat utilization by zone</CardTitle></CardHeader>
              <CardBody>
                {Object.values(seatByLoc).length > 0
                  ? <ComparisonBarChart data={Object.values(seatByLoc)} bars={[{ key: "occupied", color: "#6366f1" }, { key: "available", color: "#3b82f6" }]}/>
                  : <p className="text-sm text-ink-400 text-center py-16">No seat data.</p>}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal open={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Fee Receipt" size="lg">
        <ReceiptCard receipt={viewReceipt} onClose={() => setViewReceipt(null)}/>
      </Modal>
    </div>
  );
}
