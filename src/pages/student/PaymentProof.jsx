import { useEffect, useRef, useState } from "react";
import { Receipt, UploadCloud, X, MessageSquareText, IndianRupee, Clock, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { formatDateTime } from "../../utils/format";
import { submitPaymentProof, getMyPaymentProofs } from "../../api/paymentApi";

const STATUS_CONFIG = {
  PENDING: { tone: "warning", icon: Clock, label: "Pending review" },
  VERIFIED: { tone: "success", icon: CheckCircle2, label: "Verified" },
  REJECTED: { tone: "danger", icon: XCircle, label: "Rejected" },
};

export default function PaymentProof() {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [amountClaimed, setAmountClaimed] = useState("");
  const fileInputRef = useRef(null);

  const fetchProofs = () => {
    setLoading(true);
    getMyPaymentProofs()
      .then(({ data }) => setProofs(data || []))
      .catch(() => toast.error("Couldn't load your submissions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProofs(); }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setScreenshot(null);
    setPreview(null);
    setDescription("");
    setAmountClaimed("");
  };

  const handleSubmit = async () => {
    if (!screenshot && !description.trim()) {
      toast.error("Add a screenshot or a description before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await submitPaymentProof({ screenshot, description, amountClaimed: amountClaimed || undefined });
      toast.success("Payment proof submitted — your admin will review it shortly");
      resetForm();
      fetchProofs();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to submit payment proof");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Payment Proof</h2>
        <p className="text-sm text-ink-400 mt-1">Upload a screenshot of your payment, or just describe it — your admin will verify and update your fee status</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Receipt size={16} className="text-amber-400" />
          <CardTitle>Submit a new proof</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>Screenshot <span className="text-ink-500 font-normal">(optional)</span></Label>
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Payment screenshot preview" className="h-40 rounded-xl border border-ink-700 object-cover" />
                <button
                  onClick={() => { setScreenshot(null); setPreview(null); }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-white flex items-center justify-center shadow-[var(--shadow-soft)]"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-ink-600 hover:border-amber-400 flex flex-col items-center justify-center text-ink-500 hover:text-amber-300 gap-1.5 transition-colors"
              >
                <UploadCloud size={22} />
                <p className="text-xs">Click to upload screenshot</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
          </div>

          <div>
            <Label>Amount paid <span className="text-ink-500 font-normal">(optional)</span></Label>
            <Input
              type="number"
              icon={<IndianRupee size={15} />}
              placeholder="e.g. 1500"
              value={amountClaimed}
              onChange={(e) => setAmountClaimed(e.target.value)}
            />
          </div>

          <div>
            <Label>Description <span className="text-ink-500 font-normal">(optional)</span></Label>
            <Textarea
              placeholder="e.g. Paid via GPay on 23 June, reference no. 12345"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} loading={submitting} className="w-full">
            Submit payment proof
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <MessageSquareText size={16} className="text-amber-400" />
          <CardTitle>Your submissions</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <SkeletonRow key={i} cols={1} />)
          ) : proofs.length === 0 ? (
            <EmptyState icon={<Receipt size={26} />} title="No submissions yet" description="Once you submit a payment proof, it'll show up here with its review status." />
          ) : (
            proofs.map((p) => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={p.id} className="flex items-start gap-3 rounded-xl border border-ink-700 p-3.5">
                  {p.screenshotUrl ? (
                    <img src={p.screenshotUrl} alt="Submitted proof" className="h-14 w-14 rounded-lg object-cover border border-ink-700 shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-ink-800 flex items-center justify-center text-ink-500 shrink-0">
                      <Receipt size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-ink-100 font-medium">
                        {p.amountClaimed ? `₹${p.amountClaimed.toLocaleString("en-IN")}` : "Payment proof"}
                      </p>
                      <Badge tone={cfg.tone} className="shrink-0">
                        <StatusIcon size={12} /> {cfg.label}
                      </Badge>
                    </div>
                    {p.description && <p className="text-xs text-ink-400 mt-1 line-clamp-2">{p.description}</p>}
                    <p className="text-xs text-ink-500 mt-1">{formatDateTime(p.submittedAt)}</p>
                    {p.status === "REJECTED" && p.adminNote && (
                      <p className="text-xs text-danger mt-1">Admin note: {p.adminNote}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
