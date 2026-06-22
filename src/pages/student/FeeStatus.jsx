import { useEffect, useState } from "react";
import { Wallet, AlertCircle, Receipt, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Feedback";
import { formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";
import { getMyFees } from "../../api/studentApi";

export default function FeeStatus() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyFees()
      .then(({ data }) => setFees(data || []))
      .catch(() => toast.error("Couldn't load fee records", { id: "student-fees" }))
      .finally(() => setLoading(false));
  }, []);

  // Latest fee record is the current cycle
  const latestFee = fees.length > 0
    ? fees.reduce((latest, f) => (f.monthId > latest.monthId ? f : latest), fees[0])
    : null;

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">Fee status</h2>
          <p className="text-sm text-ink-400 mt-1">Your current plan and payment history</p>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (!latestFee) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">Fee status</h2>
          <p className="text-sm text-ink-400 mt-1">Your current plan and payment history</p>
        </div>
        <Card className="p-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-ink-800 text-ink-400 flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} />
          </div>
          <p className="text-sm text-ink-400">No fee records yet. Ask your library admin to assign you a plan.</p>
        </Card>
      </div>
    );
  }

  const isPaid = latestFee.feeStatus === "PAID";

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Fee status</h2>
        <p className="text-sm text-ink-400 mt-1">Your current plan and payment history</p>
      </div>

      <Card className="p-7 text-center">
        <div className={`h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isPaid ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
          {isPaid ? <CheckCircle2 size={28} /> : <Wallet size={28} />}
        </div>
        <Badge tone={isPaid ? "success" : "danger"} className="mb-3">{latestFee.feeStatus}</Badge>
        <p className="font-display text-3xl text-ink-50">{formatCurrency(latestFee.payable)}</p>
        <p className="text-sm text-ink-400 mt-1">
          {isPaid
            ? `Paid on ${formatDate(latestFee.paymentDate)}`
            : `Due by ${formatDate(latestFee.dueDate)}`}
        </p>
        {latestFee.balance > 0 && (
          <p className="text-sm text-danger mt-1">Balance pending: {formatCurrency(latestFee.balance)}</p>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment history</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          {fees.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-4">No payment records yet.</p>
          ) : (
            fees
              .sort((a, b) => b.monthId - a.monthId)
              .map((f) => (
                <div key={f.feeId} className="flex items-center justify-between rounded-xl border border-ink-700 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ink-800 flex items-center justify-center text-amber-400">
                      <Receipt size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-ink-100 font-medium">{monthIdToLabel(f.monthId)}</p>
                      <p className="text-xs text-ink-500">
                        {f.feeStatus === "PAID" && f.paymentDate
                          ? `Paid ${formatDate(f.paymentDate)}`
                          : `Due ${formatDate(f.dueDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink-100">{formatCurrency(f.Receive || 0)}</p>
                    <Badge tone={f.feeStatus === "PAID" ? "success" : f.feeStatus === "PARTIAL" ? "warning" : "danger"} className="text-xs mt-0.5">
                      {f.feeStatus}
                    </Badge>
                  </div>
                </div>
              ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
