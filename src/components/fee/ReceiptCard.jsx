import { Building2, User, CreditCard, IndianRupee, Hash, Phone, MapPin, FileText, MessageCircle } from "lucide-react";
import { formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";

/**
 * Renders a printable / shareable fee receipt.
 * Props: receipt (FeeReceiptDTO shape)
 */
export default function ReceiptCard({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    const content = document.getElementById("receipt-print-area");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Receipt ${receipt.receiptNumber}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        h2 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 13px; }
        .label { color: #6b7280; }
        .total { font-weight: 700; font-size: 15px; margin-top: 8px; border-top: 2px solid #111; padding-top: 8px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .paid { background: #d1fae5; color: #065f46; }
        .partial { background: #fef3c7; color: #92400e; }
        .unpaid { background: #fee2e2; color: #991b1b; }
        .history { margin-top: 4px; }
        .history-row { display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin: 3px 0; }
        @media print { body { padding: 0; } }
      </style></head><body>
      ${content ? content.innerHTML : ""}
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleWhatsApp = () => {
    const phone = receipt.studentPhone?.replace(/\D/g, "");
    if (!phone) { alert("No phone number found for this student."); return; }
    const balance = receipt.balanceAfter ?? 0;
    const msg = encodeURIComponent(
      `Hello ${receipt.studentName},\n\nYour payment of ${formatCurrency(receipt.amountPaid)} has been verified successfully.\n\nReceipt No: ${receipt.receiptNumber}\nDate: ${formatDate(receipt.paymentDate)}\nRemaining Balance: ${formatCurrency(balance)}\n\nThank You.\n${receipt.libraryName || ""}`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
  };

  const fee = receipt.fee;
  const status = fee?.feeStatus;
  const statusColor = status === "PAID" ? "paid" : status === "PARTIAL" ? "partial" : "unpaid";

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-ink-700 text-ink-100 rounded-lg hover:bg-ink-600 transition-colors"
        >
          <FileText size={14} /> Print / Download PDF
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
        >
          <MessageCircle size={14} /> Share on WhatsApp
        </button>
        {onClose && (
          <button onClick={onClose} className="px-3 py-1.5 text-sm bg-ink-800 text-ink-400 rounded-lg hover:bg-ink-700 transition-colors">
            Close
          </button>
        )}
      </div>

      {/* Receipt Body */}
      <div id="receipt-print-area" className="bg-white text-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 max-w-xl mx-auto font-sans">

        {/* Header — Library Details */}
        <div className="text-center border-b-2 border-gray-900 pb-4 mb-4">
          <h1 className="text-xl font-bold tracking-tight">{receipt.libraryName || "Library"}</h1>
          {receipt.libraryAddress && <p className="text-sm text-gray-500 mt-0.5 flex items-center justify-center gap-1"><MapPin size={11} />{receipt.libraryAddress}</p>}
          {receipt.libraryPhone && <p className="text-sm text-gray-500 flex items-center justify-center gap-1"><Phone size={11} />{receipt.libraryPhone}</p>}
          {receipt.libraryGst && <p className="text-xs text-gray-400 mt-0.5">GST: {receipt.libraryGst}</p>}
          <div className="mt-2 inline-block bg-gray-100 rounded px-3 py-1">
            <p className="text-xs font-semibold text-gray-600">FEE RECEIPT</p>
          </div>
        </div>

        {/* Receipt Number + Date row */}
        <div className="flex justify-between text-sm mb-4">
          <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
            <Hash size={13} className="text-gray-400" />
            {receipt.receiptNumber}
          </div>
          <div className="text-gray-500">{formatDate(receipt.paymentDate)}</div>
        </div>

        {/* Student Details */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <User size={11} /> Student Details
          </h2>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <Row label="Name" value={receipt.studentName} />
            {receipt.admissionNumber && <Row label="Admission No." value={receipt.admissionNumber} />}
            {receipt.studentPhone && <Row label="Mobile" value={receipt.studentPhone} />}
            {receipt.seatNumber && <Row label="Seat No." value={receipt.seatNumber} />}
            {receipt.membershipPlan && <Row label="Membership Plan" value={receipt.membershipPlan} />}
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <CreditCard size={11} /> Payment Details
          </h2>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <Row label="Payment Mode" value={receipt.paymentMode || "—"} />
            {receipt.transactionRef && <Row label="Transaction Ref." value={receipt.transactionRef} />}
            <Row label="Payment Date" value={formatDate(receipt.paymentDate)} />
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <IndianRupee size={11} /> Fee Breakdown
          </h2>
          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <Row label={`Monthly Fee (${monthIdToLabel(receipt.monthId)})`} value={formatCurrency(receipt.monthlyFee)} />
            {receipt.lateFee > 0 && <Row label="Late Fee" value={formatCurrency(receipt.lateFee)} highlight="red" />}
            {receipt.concession > 0 && <Row label="Concession / Discount" value={`- ${formatCurrency(receipt.concession)}`} highlight="green" />}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <Row label="Amount Paid (This Transaction)" value={formatCurrency(receipt.amountPaid)} bold />
              <Row label="Remaining Balance" value={formatCurrency(receipt.balanceAfter)} bold highlight={receipt.balanceAfter > 0 ? "red" : "green"} />
            </div>
          </div>
        </div>

        {/* Payment History for this fee month */}
        {fee && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Building2 size={11} /> Payment History ({monthIdToLabel(fee.monthId)})
            </h2>
            <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
              <Row label="Total Monthly Fee" value={formatCurrency(fee.payable)} />
              {fee.lateFee > 0 && <Row label="Late Fee" value={formatCurrency(fee.lateFee)} />}
              {fee.concession > 0 && <Row label="Concession" value={`- ${formatCurrency(fee.concession)}`} />}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Row label="Total Paid (All Transactions)" value={formatCurrency(fee.Receive || 0)} bold />
                <Row label="Balance" value={formatCurrency(fee.balance)} bold highlight={fee.balance > 0 ? "red" : "green"} />
              </div>
              <div className="mt-2 flex justify-end">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  status === "PAID" ? "bg-green-100 text-green-700" :
                  status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>{status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-3 mt-3">
          <p className="text-xs text-gray-400">This is a computer-generated receipt and does not require a signature.</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{receipt.libraryName}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, highlight }) {
  const valClass = bold ? "font-bold" : "font-medium";
  const colorClass = highlight === "red" ? "text-red-600" : highlight === "green" ? "text-green-600" : "text-gray-800";
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${valClass} ${colorClass}`}>{value ?? "—"}</span>
    </div>
  );
}
