import { useEffect, useState } from "react";
import { Receipt, Hash, IndianRupee, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";
import { getMyReceipts, getMyReceiptById } from "../../api/paymentApi";
import ReceiptCard from "../../components/fee/ReceiptCard";

export default function MyReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    getMyReceipts()
      .then(({ data }) => setReceipts(data || []))
      .catch(() => toast.error("Couldn't load receipts"))
      .finally(() => setLoading(false));
  }, []);

  const openReceipt = async (id) => {
    setLoadingReceipt(true);
    try {
      const { data } = await getMyReceiptById(id);
      setViewReceipt(data);
    } catch {
      toast.error("Couldn't load receipt details");
    } finally {
      setLoadingReceipt(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">My Receipts</h2>
        <p className="text-sm text-ink-400 mt-0.5">View and download your payment receipts</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Payment Receipts</CardTitle></CardHeader>
        <CardBody>
          <Table>
            <THead>
              <tr>
                <TH>Receipt No.</TH>
                <TH>Month</TH>
                <TH>Amount Paid</TH>
                <TH>Balance</TH>
                <TH>Date</TH>
                <TH className="text-right">Action</TH>
              </tr>
            </THead>
            <TBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>
                ))
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Receipt size={26} />}
                      title="No receipts yet"
                      description="Receipts are generated automatically after your payment is verified."
                    />
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-amber-300 font-mono text-xs font-semibold">
                      <span className="flex items-center gap-1"><Hash size={11} />{r.receiptNumber}</span>
                    </TD>
                    <TD>{monthIdToLabel(r.monthId)}</TD>
                    <TD className="font-semibold text-ink-100">{formatCurrency(r.amountPaid)}</TD>
                    <TD>
                      <Badge tone={r.balanceAfter > 0 ? "danger" : "success"}>
                        {formatCurrency(r.balanceAfter)}
                      </Badge>
                    </TD>
                    <TD className="text-ink-400">{formatDate(r.paymentDate)}</TD>
                    <TD className="text-right">
                      <Button size="sm" variant="secondary" onClick={() => openReceipt(r.id)} loading={loadingReceipt}>
                        <Receipt size={13} /> View
                      </Button>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <Modal
        open={!!viewReceipt}
        onClose={() => setViewReceipt(null)}
        title="Fee Receipt"
        size="lg"
      >
        <ReceiptCard receipt={viewReceipt} onClose={() => setViewReceipt(null)} />
      </Modal>
    </div>
  );
}
