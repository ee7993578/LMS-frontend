import { useEffect, useState } from "react";
import { ShieldCheck, Search, Receipt, Clock, CheckCircle2, XCircle, IndianRupee, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import StatCard from "../../components/ui/StatCard";
import { Input, Select, Label, Textarea } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { formatDateTime, formatCurrency, monthIdToLabel } from "../../utils/format";
import {
  getLibraryPaymentProofs,
  verifyPaymentProof,
  rejectPaymentProof,
} from "../../api/paymentApi";
import { getLibraryFees } from "../../api/libraryAdminApi";

const STATUS_CONFIG = {
  PENDING: { tone: "warning", icon: Clock, label: "Pending" },
  VERIFIED: { tone: "success", icon: CheckCircle2, label: "Verified" },
  REJECTED: { tone: "danger", icon: XCircle, label: "Rejected" },
};

export default function PaymentVerification() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const [reviewing, setReviewing] = useState(null); // proof being verified
  const [rejecting, setRejecting] = useState(null); // proof being rejected
  const [imagePreview, setImagePreview] = useState(null); // full-size screenshot viewer
  const [saving, setSaving] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const [form, setForm] = useState({ Receive: "", concession: "", lateFee: "" });
  const [outstandingFee, setOutstandingFee] = useState(null);
  const [loadingOutstanding, setLoadingOutstanding] = useState(false);

  const fetchProofs = () => {
    setLoading(true);
    getLibraryPaymentProofs()
      .then(({ data }) => setProofs(data || []))
      .catch(() => toast.error("Couldn't load payment proofs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProofs(); }, []);

  const filtered = proofs.filter((p) => {
    const statusMatch = statusFilter === "ALL" || p.status === statusFilter;
    const searchMatch = p.studentName?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && (search ? searchMatch : true);
  });

  const pendingCount = proofs.filter((p) => p.status === "PENDING").length;
  const verifiedCount = proofs.filter((p) => p.status === "VERIFIED").length;
  const rejectedCount = proofs.filter((p) => p.status === "REJECTED").length;

  const openReview = (proof) => {
    setReviewing(proof);
    setForm({
      Receive: proof.amountClaimed || "",
      concession: "",
      lateFee: "",
    });
    setOutstandingFee(null);
    setLoadingOutstanding(true);
    getLibraryFees()
      .then(({ data }) => {
        const studentFees = (data || []).filter((f) => f.studentId === proof.studentId && f.feeStatus !== "PAID");
        const oldest = studentFees.sort((a, b) => a.monthId - b.monthId)[0] || null;
        setOutstandingFee(oldest);
      })
      .catch(() => setOutstandingFee(null))
      .finally(() => setLoadingOutstanding(false));
  };

  const handleVerify = async () => {
    setSaving(true);
    try {
      await verifyPaymentProof(reviewing.id, {
        Receive: Number(form.Receive) || 0,
        concession: Number(form.concession) || 0,
        lateFee: Number(form.lateFee) || 0,
      });
      toast.success("Proof verified — student's fee record has been updated");
      setReviewing(null);
      fetchProofs();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to verify proof. Make sure this student has a fee record.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await rejectPaymentProof(rejecting.id, rejectNote);
      toast.success("Proof rejected");
      setRejecting(null);
      setRejectNote("");
      fetchProofs();
    } catch {
      toast.error("Failed to reject proof");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">Payment verification</h2>
        <p className="text-sm text-ink-400 mt-0.5">Review screenshots and descriptions students submit, then verify to update their fee record</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Pending review" value={pendingCount} icon={<Clock size={18} />} tone="amber" />
        <StatCard label="Verified" value={verifiedCount} icon={<CheckCircle2 size={18} />} tone="teal" />
        <StatCard label="Rejected" value={rejectedCount} icon={<XCircle size={18} />} tone="danger" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="max-w-xs flex-1">
          <Input icon={<Search size={16} />} placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      <Table>
        <THead><tr><TH>Student</TH><TH>Proof</TH><TH>Amount claimed</TH><TH>Description</TH><TH>Submitted</TH><TH>Status</TH><TH className="text-right">Action</TH></tr></THead>
        <TBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7}><SkeletonRow cols={7} /></td></tr>)
          ) : filtered.length === 0 ? (
            <tr><td colSpan={7}><EmptyState icon={<ShieldCheck size={26} />} title="No payment proofs" description="Submissions from students will appear here for you to verify." /></td></tr>
          ) : (
            filtered.map((p) => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <TR key={p.id}>
                  <TD className="text-ink-100 font-medium">{p.studentName || "—"}</TD>
                  <TD>
                    {p.screenshotUrl ? (
                      <button onClick={() => setImagePreview(p.screenshotUrl)}>
                        <img src={p.screenshotUrl} alt="Proof" className="h-10 w-10 rounded-lg object-cover border border-ink-700 hover:border-amber-400 transition-colors" />
                      </button>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-ink-800 flex items-center justify-center text-ink-500">
                        <ImageOff size={15} />
                      </div>
                    )}
                  </TD>
                  <TD>{p.amountClaimed ? formatCurrency(p.amountClaimed) : "—"}</TD>
                  <TD className="max-w-xs truncate text-ink-400">{p.description || "—"}</TD>
                  <TD>{formatDateTime(p.submittedAt)}</TD>
                  <TD><Badge tone={cfg.tone}><StatusIcon size={12} /> {cfg.label}</Badge></TD>
                  <TD className="text-right">
                    {p.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setRejecting(p); setRejectNote(""); }}>Reject</Button>
                        <Button size="sm" onClick={() => openReview(p)}>Verify</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-500">{p.verifiedAt ? formatDateTime(p.verifiedAt) : "—"}</span>
                    )}
                  </TD>
                </TR>
              );
            })
          )}
        </TBody>
      </Table>

      {/* Verify modal — same fee fields as FeeManagement's update flow */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`Verify payment — ${reviewing?.studentName || ""}`}
        footer={<>
          <Button variant="secondary" onClick={() => setReviewing(null)}>Cancel</Button>
          <Button onClick={handleVerify} loading={saving}>Verify &amp; update fee</Button>
        </>}
      >
        <div className="space-y-4">
          {reviewing?.screenshotUrl && (
            <img src={reviewing.screenshotUrl} alt="Payment proof" className="w-full max-h-64 object-contain rounded-xl border border-ink-700 bg-ink-900" />
          )}
          {reviewing?.description && (
            <p className="text-sm text-ink-300 bg-ink-800 rounded-xl p-3 leading-relaxed">{reviewing.description}</p>
          )}

          {loadingOutstanding ? (
            <div className="h-14 rounded-xl bg-ink-800 animate-pulse" />
          ) : outstandingFee ? (
            <div className="rounded-xl border border-ink-700 bg-ink-800 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-500">{monthIdToLabel(outstandingFee.monthId)} — currently owes</p>
                <p className="text-ink-50 font-display text-lg">{formatCurrency(outstandingFee.balance)}</p>
              </div>
              <p className="text-xs text-ink-500">Payable {formatCurrency(outstandingFee.payable)} · Already received {formatCurrency(outstandingFee.Receive || 0)}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3.5">
              <p className="text-xs text-ink-300">No outstanding fee found — this student's fees are already fully paid, or no fee record exists yet for them.</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Amount received (₹)</Label>
              <Input type="number" icon={<IndianRupee size={15} />} value={form.Receive} onChange={(e) => setForm({ ...form, Receive: e.target.value })} />
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

          {outstandingFee && (() => {
            const newReceive = (outstandingFee.Receive || 0) + (Number(form.Receive) || 0);
            const newConcession = (outstandingFee.concession || 0) + (Number(form.concession) || 0);
            const newLateFee = (outstandingFee.lateFee || 0) + (Number(form.lateFee) || 0);
            const newBalance = Math.max(0, (outstandingFee.payable + newLateFee) - (newReceive + newConcession));
            const previewStatus = newBalance <= 0 ? "PAID" : newReceive > 0 ? "PARTIAL" : "UNPAID";
            const cfg = { PAID: { tone: "success", label: "Paid" }, PARTIAL: { tone: "warning", label: "Partial" }, UNPAID: { tone: "danger", label: "Unpaid" } }[previewStatus];
            return (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-400">After this verification</p>
                  <p className="text-sm text-ink-100">Balance will be <span className="font-semibold">{formatCurrency(newBalance)}</span></p>
                </div>
                <Badge tone={cfg.tone}>{cfg.label}</Badge>
              </div>
            );
          })()}

          <p className="text-xs text-ink-500">
            Status is calculated automatically from payable vs. amount received — fully paid → <span className="text-ink-300">Paid</span>, partly paid → <span className="text-ink-300">Partial</span>, nothing received → <span className="text-ink-300">Unpaid</span>. This amount <span className="text-ink-300 font-medium">adds</span> to what's already been received; it does not overwrite it.
          </p>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={`Reject submission — ${rejecting?.studentName || ""}`}
        footer={<>
          <Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} loading={saving}>Reject</Button>
        </>}
      >
        <div>
          <Label>Note to student <span className="text-ink-500 font-normal">(optional)</span></Label>
          <Textarea
            placeholder="e.g. Screenshot is unclear, please resubmit"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
        </div>
      </Modal>

      {/* Full-size image viewer */}
      <Modal open={!!imagePreview} onClose={() => setImagePreview(null)} title="Payment screenshot" size="lg">
        {imagePreview && <img src={imagePreview} alt="Payment proof full size" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
}
