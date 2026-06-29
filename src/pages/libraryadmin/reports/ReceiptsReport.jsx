import { useEffect, useState } from "react";
import { Receipt, Search, RefreshCw, Hash } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../../components/ui/Table";
import { SkeletonRow, EmptyState } from "../../../components/ui/Feedback";
import { Modal } from "../../../components/ui/Modal";
import { formatCurrency, formatDate, monthIdToLabel } from "../../../utils/format";
import { getLibraryReceipts, getReceiptById } from "../../../api/paymentApi";
import ReceiptCard from "../../../components/fee/ReceiptCard";
import { PageHeader } from "./reportUtils";

export default function ReceiptsReport() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [viewReceipt, setViewReceipt] = useState(null);

  const load = () => {
    setLoading(true);
    getLibraryReceipts()
      .then(r => setReceipts(r.data || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openReceipt = (id) => {
    getReceiptById(id)
      .then(r => setViewReceipt(r.data))
      .catch(() => toast.error("Couldn't load receipt"));
  };

  const filtered = receipts.filter(r =>
    !search ||
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.receiptNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Fee Receipts" subtitle="All verified payment receipts">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-ink-500"/>
          <input className="bg-ink-800 border border-ink-600 rounded-xl pl-9 pr-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400 w-48"
            placeholder="Search name / receipt" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </PageHeader>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <Card>
          <CardBody>
            <Table>
              <THead><tr><TH>Receipt No.</TH><TH>Student</TH><TH>Month</TH><TH>Amount Paid</TH><TH>Balance After</TH><TH>Mode</TH><TH>Date</TH><TH className="text-right">View</TH></tr></THead>
              <TBody>
                {loading
                  ? Array.from({length:5}).map((_,i) => <TR key={i}>{Array.from({length:8}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                  : filtered.length === 0
                    ? <tr><td colSpan={8}><EmptyState icon={<Receipt size={24}/>} title="No receipts" description="Receipts are created after payment verification."/></td></tr>
                    : filtered.map(r => (
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
                          <Button size="sm" variant="secondary" onClick={() => openReceipt(r.id)}>
                            <Receipt size={13}/> View
                          </Button>
                        </TD>
                      </TR>
                    ))
                }
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {loading && Array.from({length:4}).map((_,i) => <div key={i} className="h-24 bg-ink-800 rounded-2xl animate-pulse"/>)}
        {!loading && filtered.length === 0 && <div className="text-center py-12 text-ink-500 text-sm">No receipts found</div>}
        {filtered.map(r => (
          <div key={r.id} className="bg-ink-800 border border-ink-700 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-ink-100 text-sm">{r.studentName}</p>
                <p className="text-xs text-amber-300 font-mono mt-0.5">{r.receiptNumber}</p>
              </div>
              <Badge tone={r.balanceAfter > 0 ? "danger" : "success"}>{formatCurrency(r.balanceAfter)}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs border-t border-ink-700 pt-3">
              <div><p className="text-ink-600">Month</p><p className="text-ink-300 font-medium">{monthIdToLabel(r.monthId)}</p></div>
              <div><p className="text-ink-600">Paid</p><p className="text-green-400 font-semibold">{formatCurrency(r.amountPaid)}</p></div>
              <div><p className="text-ink-600">Date</p><p className="text-ink-400">{formatDate(r.paymentDate)}</p></div>
            </div>
            <button onClick={() => openReceipt(r.id)}
              className="mt-3 w-full py-2 bg-ink-700 hover:bg-ink-600 rounded-xl text-xs text-ink-300 font-medium transition-colors flex items-center justify-center gap-1.5">
              <Receipt size={12}/> View Receipt
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Fee Receipt" size="lg">
        <ReceiptCard receipt={viewReceipt} onClose={() => setViewReceipt(null)}/>
      </Modal>
    </div>
  );
}
