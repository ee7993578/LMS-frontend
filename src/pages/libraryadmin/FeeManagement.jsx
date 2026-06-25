import { useEffect, useState } from "react";
import { Wallet, Search, IndianRupee, Receipt, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import { Input, Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { getLibraryFees, updateStudentFee } from "../../api/libraryAdminApi";
import { formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";

export default function FeeManagement() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingFee, setEditingFee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ Receive: "", concession: "", lateFee: "" });

  const fetchFees = () => {
    setLoading(true);
    getLibraryFees().then(({ data }) => setFees(data || [])).catch(() => toast.error("Couldn't load fee records", { id: "load-fees" })).finally(() => setLoading(false));
  };

  useEffect(() => { fetchFees(); }, []);

  const filtered = fees.filter((f) => {
    const statusMatch = statusFilter === "ALL" || f.feeStatus === statusFilter;
    const searchMatch = f.student?.fullName?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && (search ? searchMatch : true);
  });

  const totalCollected = fees.reduce((sum, f) => sum + (f.Receive || 0), 0);
  const totalPending = fees.filter((f) => f.feeStatus !== "PAID").reduce((sum, f) => sum + (f.balance || 0), 0);
  const overdueCount = fees.filter((f) => f.feeStatus === "UNPAID").length;

  const openEdit = (fee) => {
    setEditingFee(fee);
    setForm({ Receive: fee.Receive || "", concession: fee.concession || "", lateFee: fee.lateFee || "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStudentFee(editingFee.studentId || editingFee.student?.id, {
        ...editingFee,
        Receive: Number(form.Receive),
        concession: Number(form.concession),
        lateFee: Number(form.lateFee),
        feeStatus: null,
        balance: Math.max(0, (editingFee.payable || 0) - Number(form.Receive) - Number(form.concession)),
      });
      toast.success("Fee record updated");
      setEditingFee(null);
      fetchFees();
    } catch {
      toast.error("Failed to update fee record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Fee management</h2>
          <p className="text-sm text-ink-400 mt-0.5">Collection, dues, and receipts across your students</p>
        </div>
        <Link to="/admin/payment-verification">
          <Button variant="secondary" size="sm"><ShieldCheck size={14} /> Payment proofs <ArrowRight size={14} /></Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Collected this cycle" value={totalCollected} prefix="₹" icon={<IndianRupee size={18} />} tone="amber" />
        <StatCard label="Pending balance" value={totalPending} prefix="₹" icon={<Wallet size={18} />} tone="danger" />
        <StatCard label="Overdue students" value={overdueCount} icon={<AlertCircle size={18} />} tone="info" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="max-w-xs flex-1">
          <Input icon={<Search size={16} />} placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
        </Select>
      </div>

      <Table>
        <THead><tr><TH>Student</TH><TH>Month</TH><TH>Due date</TH><TH>Payable</TH><TH>Received</TH><TH>Balance</TH><TH>Status</TH><TH className="text-right">Action</TH></tr></THead>
        <TBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8}><SkeletonRow cols={8} /></td></tr>)
          ) : filtered.length === 0 ? (
            <tr><td colSpan={8}><EmptyState icon={<Receipt size={26} />} title="No fee records" description="Fee records will appear here once students are assigned a plan." /></td></tr>
          ) : (
            filtered.map((f) => (
              <TR key={f.feeId}>
                <TD className="text-ink-100 font-medium">{f.student?.fullName || "—"}</TD>
                <TD>{monthIdToLabel(f.monthId)}</TD>
                <TD>{formatDate(f.dueDate)}</TD>
                <TD>{formatCurrency(f.payable)}</TD>
                <TD>{formatCurrency(f.Receive)}</TD>
                <TD className={f.balance > 0 ? "text-danger" : ""}>{formatCurrency(f.balance)}</TD>
                <TD><Badge tone={STATUS_TONE[f.feeStatus]}>{f.feeStatus}</Badge></TD>
                <TD className="text-right">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(f)}>Update</Button>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Modal
        open={!!editingFee}
        onClose={() => setEditingFee(null)}
        title={`Update fee — ${editingFee?.student?.fullName || ""}`}
        footer={<>
          <Button variant="secondary" onClick={() => setEditingFee(null)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save</Button>
        </>}
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Amount received (₹)</Label>
              <Input type="number" value={form.Receive} onChange={(e) => setForm({ ...form, Receive: e.target.value })} />
            </div>
            <div>
              <Label>Concession (₹) <span className="text-ink-500 font-normal">(optional)</span></Label>
              <Input type="number" value={form.concession} onChange={(e) => setForm({ ...form, concession: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Late fee (₹) <span className="text-ink-500 font-normal">(optional)</span></Label>
              <Input type="number" value={form.lateFee} onChange={(e) => setForm({ ...form, lateFee: e.target.value })} />
            </div>
          </div>

          {editingFee && (() => {
            const receive = Number(form.Receive) || 0;
            const concession = Number(form.concession) || 0;
            const lateFee = Number(form.lateFee) || 0;
            const balance = Math.max(0, (editingFee.payable + lateFee) - (receive + concession));
            const previewStatus = balance <= 0 ? "PAID" : receive > 0 ? "PARTIAL" : "UNPAID";
            return (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-400">Resulting balance</p>
                  <p className="text-sm text-ink-100">{formatCurrency(balance)}</p>
                </div>
                <Badge tone={STATUS_TONE[previewStatus]}>{previewStatus}</Badge>
              </div>
            );
          })()}

          <p className="text-xs text-ink-500">
            Status is calculated automatically — fully received → <span className="text-ink-300">Paid</span>, partly received → <span className="text-ink-300">Partial</span>, nothing received → <span className="text-ink-300">Unpaid</span>.
          </p>
        </div>
      </Modal>
    </div>
  );
}
