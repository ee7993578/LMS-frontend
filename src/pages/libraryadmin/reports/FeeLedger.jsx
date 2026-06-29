import { useEffect, useState } from "react";
import { BookOpen, Download, Search } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { EmptyState } from "../../../components/ui/Feedback";
import { formatCurrency, formatDate } from "../../../utils/format";
import { getStudentLedger } from "../../../api/paymentApi";
import { getAllStudents } from "../../../api/libraryAdminApi";
import { PageHeader, exportCSV } from "./reportUtils";

export default function FeeLedger() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [ledger, setLedger]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [searchStu, setSearchStu] = useState("");

  useEffect(() => {
    getAllStudents().then(r => setStudents(r.data || [])).catch(() => {});
  }, []);

  const load = () => {
    if (!studentId) return toast.error("Please select a student");
    setLoading(true);
    getStudentLedger(studentId)
      .then(r => setLedger(r.data))
      .catch(() => toast.error("Failed to load ledger"))
      .finally(() => setLoading(false));
  };

  const filteredStudents = students.filter(s =>
    !searchStu || s.fullName?.toLowerCase().includes(searchStu.toLowerCase())
  );

  const selectedName = students.find(s => String(s.id) === String(studentId))?.fullName;

  return (
    <div>
      <PageHeader title="Fee Ledger" subtitle="Complete debit/credit ledger per student">
        {ledger && (
          <Button size="sm" variant="secondary" onClick={() => exportCSV(ledger.entries || [], `ledger-${selectedName}.csv`)}>
            <Download size={13}/> Export CSV
          </Button>
        )}
      </PageHeader>

      {/* Student selector */}
      <Card className="mb-5">
        <CardBody>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-ink-400 mb-1.5">Search Student</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-ink-500"/>
                <input className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-9 pr-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400"
                  placeholder="Type name to filter..." value={searchStu} onChange={e => setSearchStu(e.target.value)}/>
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-ink-400 mb-1.5">Select Student</label>
              <select className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
                value={studentId} onChange={e => setStudentId(e.target.value)}>
                <option value="">— Select student —</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} {s.seat ? `(Seat ${s.seat.seatName})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={load} disabled={!studentId} loading={loading}>
              <BookOpen size={14}/> View Ledger
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Ledger table */}
      {ledger && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Ledger — {selectedName}</CardTitle>
            <div className="text-right">
              <p className="text-xs text-ink-500">Current Balance</p>
              <p className={`text-xl font-display font-bold ${ledger.currentBalance > 0 ? "text-red-400" : "text-green-400"}`}>
                {formatCurrency(ledger.currentBalance)}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table>
                <THead><tr><TH>Date</TH><TH>Description</TH><TH className="text-right">Debit (₹)</TH><TH className="text-right">Credit (₹)</TH><TH className="text-right">Balance (₹)</TH></tr></THead>
                <TBody>
                  {(ledger.entries || []).length === 0
                    ? <tr><td colSpan={5}><EmptyState icon={<BookOpen size={22}/>} title="No ledger entries" description="No fee records found for this student."/></td></tr>
                    : (ledger.entries || []).map((e, i) => (
                      <TR key={i} className={e.type === "DEBIT" ? "bg-red-500/5" : "bg-green-500/5"}>
                        <TD className="text-ink-400 text-sm whitespace-nowrap">{formatDate(e.date)}</TD>
                        <TD className="text-ink-200">{e.description}</TD>
                        <TD className="text-right">{e.debit > 0 ? <span className="text-red-400 font-semibold">{formatCurrency(e.debit)}</span> : <span className="text-ink-700">—</span>}</TD>
                        <TD className="text-right">{e.credit > 0 ? <span className="text-green-400 font-semibold">{formatCurrency(e.credit)}</span> : <span className="text-ink-700">—</span>}</TD>
                        <TD className="text-right font-bold text-ink-100">{formatCurrency(e.balance)}</TD>
                      </TR>
                    ))
                  }
                </TBody>
              </Table>
            </div>

            {/* Mobile timeline */}
            <div className="sm:hidden space-y-2">
              {(ledger.entries || []).map((e, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${e.type === "DEBIT" ? "bg-red-500/5 border-red-500/20" : "bg-green-500/5 border-green-500/20"}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.type === "DEBIT" ? "bg-red-400" : "bg-green-400"}`}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-200">{e.description}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{formatDate(e.date)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {e.debit > 0 && <p className="text-sm font-semibold text-red-400">-{formatCurrency(e.debit)}</p>}
                    {e.credit > 0 && <p className="text-sm font-semibold text-green-400">+{formatCurrency(e.credit)}</p>}
                    <p className="text-xs text-ink-400 mt-0.5">{formatCurrency(e.balance)}</p>
                  </div>
                </div>
              ))}
              {(ledger.entries || []).length === 0 && <p className="text-center text-ink-500 text-sm py-8">No entries found</p>}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
