import { useEffect, useRef, useState } from "react";
import { QrCode, Smartphone, MessageSquareText, Save, UploadCloud, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getAdminPaymentSettings, saveAdminPaymentSettings } from "../../api/paymentApi";
import { useOnboarding } from "../../context/OnboardingContext";
import OnboardingSuccessModal from "../../components/onboarding/OnboardingSuccessModal";
import PageHelpNote from "../../components/onboarding/PageHelpNote";

export default function PaymentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const fileInputRef = useRef(null);
  const { checkStepJustCompleted } = useOnboarding();
  const [successData, setSuccessData] = useState(null);

  const fetchSettings = () => {
    setLoading(true);
    getAdminPaymentSettings()
      .then(({ data }) => {
        setQrUrl(data?.qrImageUrl || null);
        setUpiId(data?.upiId || "");
        setPhoneNumber(data?.phoneNumber || "");
        setDescription(data?.description || "");
        setUpdatedAt(data?.updatedAt || null);
      })
      .catch(() => toast.error("Couldn't load payment settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await saveAdminPaymentSettings({ qrFile, upiId, phoneNumber, description });
      setQrUrl(data?.qrImageUrl || qrUrl);
      setUpdatedAt(data?.updatedAt || updatedAt);
      setQrFile(null);
      setQrPreview(null);
      toast.success("Payment details saved — students can now see this on their Deposit page");
      const fresh = await checkStepJustCompleted("PAYMENT");
      if (fresh) {
        setSuccessData({
          justCompletedLabel: "Payment settings",
          next: fresh.recommendedNextStep,
          allCompleted: fresh.allCompleted,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data || "Failed to save payment details");
    } finally {
      setSaving(false);
    }
  };

  const displayQr = qrPreview || qrUrl;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-50">Payment</h2>
        <p className="text-sm text-ink-400 mt-0.5">
          Set up your deposit QR code, UPI ID, and phone number — students will see these on their Deposit page when paying fees.
        </p>
      </div>

      <PageHelpNote>
        Configure payment methods used by your library so students can pay fees and your records stay organized automatically.
      </PageHelpNote>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <QrCode size={16} className="text-amber-400" />
          <CardTitle>QR Code</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="h-56 w-56 mx-auto rounded-2xl bg-ink-800 animate-pulse" />
          ) : (
            <div className="flex flex-col items-center">
              {displayQr ? (
                <div className="relative p-4 bg-white rounded-2xl">
                  <img src={displayQr} alt="Payment QR code" className="h-56 w-56 object-contain" />
                  {qrPreview && (
                    <button
                      onClick={() => { setQrFile(null); setQrPreview(null); }}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-danger text-white flex items-center justify-center shadow-[var(--shadow-soft)]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-56 w-56 rounded-2xl border-2 border-dashed border-ink-600 hover:border-amber-400 flex flex-col items-center justify-center text-ink-500 hover:text-amber-300 gap-2 transition-colors"
                >
                  <UploadCloud size={28} />
                  <p className="text-xs">Click to upload QR code</p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud size={14} /> {displayQr ? "Replace QR code" : "Upload QR code"}
              </Button>
              <p className="text-xs text-ink-500 mt-2">PNG, JPG or WEBP — up to 5MB</p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <Smartphone size={16} className="text-amber-400" />
          <CardTitle>UPI &amp; Contact</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>UPI ID</Label>
            <Input
              icon={<Smartphone size={15} />}
              placeholder="yourlibrary@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
          <div>
            <Label>Payment phone number</Label>
            <Input
              icon={<Smartphone size={15} />}
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center gap-2">
          <MessageSquareText size={16} className="text-amber-400" />
          <CardTitle>Description <span className="text-ink-500 font-normal text-sm">(optional)</span></CardTitle>
        </CardHeader>
        <CardBody>
          <Textarea
            placeholder="e.g. Pay via GPay/PhonePe to the UPI ID above, or scan the QR. Share a screenshot after paying."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </CardBody>
      </Card>

      <div className="flex items-center justify-between">
        {updatedAt ? (
          <Badge tone="success" className="gap-1.5">
            <CheckCircle2 size={12} /> Live for students
          </Badge>
        ) : (
          <p className="text-xs text-ink-500">Not set up yet — students won't see a Deposit page until you save.</p>
        )}
        <Button onClick={handleSave} loading={saving}>
          <Save size={14} /> Save payment details
        </Button>
      </div>

      <OnboardingSuccessModal data={successData} onClose={() => setSuccessData(null)} />
    </div>
  );
}
