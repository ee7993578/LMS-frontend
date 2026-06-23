import { useEffect, useState } from "react";
import { QrCode, Smartphone, Download, Copy, Check, MessageSquareText, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Feedback";
import { getStudentPaymentSettings } from "../../api/paymentApi";

export default function Deposit() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getStudentPaymentSettings()
      .then(({ data }) => setSettings(data))
      .catch(() => toast.error("Couldn't load deposit details"))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyUpi = () => {
    if (!settings?.upiId) return;
    navigator.clipboard.writeText(settings.upiId);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">Deposit</h2>
          <p className="text-sm text-ink-400 mt-1">Scan, pay, and upload your payment proof</p>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const hasAnyInfo = settings?.qrImageUrl || settings?.upiId || settings?.phoneNumber;

  if (!hasAnyInfo) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">Deposit</h2>
          <p className="text-sm text-ink-400 mt-1">Scan, pay, and upload your payment proof</p>
        </div>
        <Card className="p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-ink-800 text-ink-400 flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} />
          </div>
          <p className="text-sm text-ink-400">Your library admin hasn't set up payment details yet. Check back soon, or ask them directly.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Deposit</h2>
        <p className="text-sm text-ink-400 mt-1">Scan, pay, and upload your payment proof from the Payment Proof page</p>
      </div>

      {settings.qrImageUrl && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <QrCode size={16} className="text-amber-400" />
            <CardTitle>Scan to pay</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl">
              <img src={settings.qrImageUrl} alt="Library deposit QR code" className="h-56 w-56 object-contain" />
            </div>
            <a href={settings.qrImageUrl} download="payment-qr.png" className="mt-4">
              <Button variant="secondary" size="sm">
                <Download size={14} /> Download QR code
              </Button>
            </a>
          </CardBody>
        </Card>
      )}

      {(settings.upiId || settings.phoneNumber) && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Smartphone size={16} className="text-amber-400" />
            <CardTitle>Pay via UPI</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {settings.upiId && (
              <div className="flex items-center justify-between rounded-xl border border-ink-700 p-3.5">
                <div>
                  <p className="text-xs text-ink-500">UPI ID</p>
                  <p className="text-sm text-ink-100 font-medium">{settings.upiId}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopyUpi}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
            {settings.phoneNumber && (
              <div className="flex items-center justify-between rounded-xl border border-ink-700 p-3.5">
                <div>
                  <p className="text-xs text-ink-500">Payment phone number</p>
                  <p className="text-sm text-ink-100 font-medium">{settings.phoneNumber}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {settings.description && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <MessageSquareText size={16} className="text-amber-400" />
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-wrap">{settings.description}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
