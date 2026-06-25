import { useEffect, useState } from "react";
import { Drawer } from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { initials, formatCurrency, formatDate, monthIdToLabel } from "../../utils/format";
import { Mail, Phone, Armchair, Layers, Calendar, Wallet, Receipt } from "lucide-react";
import { getLibraryFees } from "../../api/libraryAdminApi";

export default function StudentProfileDrawer({ open, onClose, student }) {
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

  useEffect(() => {
    if (!open || !student) return;
    setLoadingFees(true);
    getLibraryFees()
      .then(({ data }) => setFees((data || []).filter((f) => f.studentId === student.id)))
      .catch(() => setFees([]))
      .finally(() => setLoadingFees(false));
  }, [open, student]);

  if (!student) return null;

  const sortedFees = [...fees].sort((a, b) => b.monthId - a.monthId);
  const latestFee = sortedFees[0] || null;

  return (
    <Drawer open={open} onClose={onClose} title="Student profile">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-xl font-semibold shrink-0">
          {initials(student.fullName)}
        </div>
        <div>
          <h3 className="font-display text-lg text-ink-50">{student.fullName}</h3>
          <Badge tone={student.active === false ? "neutral" : "success"}>{student.active === false ? "Inactive" : "Active"}</Badge>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <Mail size={15} className="text-ink-500" /> {student.email || "—"}
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <Phone size={15} className="text-ink-500" /> {student.phone || "—"}
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <Armchair size={15} className="text-ink-500" /> {student.seat?.seatName || "No seat assigned"}
        </div>
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <Layers size={15} className="text-ink-500" /> {student.plan?.name || "No plan assigned"}
        </div>
      </div>

      <div className="rounded-xl border border-ink-700 p-4 mb-4">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Wallet size={13} /> Fee summary
        </p>

        {loadingFees ? (
          <div className="h-16 rounded-lg bg-ink-800 animate-pulse" />
        ) : latestFee ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-ink-500 text-xs">{monthIdToLabel(latestFee.monthId)}</p>
                <p className="text-ink-50 font-display text-lg">{formatCurrency(latestFee.payable)}</p>
              </div>
              <Badge tone={latestFee.feeStatus === "PAID" ? "success" : latestFee.feeStatus === "PARTIAL" ? "warning" : "danger"}>
                {latestFee.feeStatus}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-2">
              <div>
                <p className="text-ink-500 text-xs">Received</p>
                <p className="text-ink-100 font-medium">{formatCurrency(latestFee.Receive || 0)}</p>
              </div>
              <div>
                <p className="text-ink-500 text-xs">Balance</p>
                <p className={`font-medium ${latestFee.balance > 0 ? "text-danger" : "text-success"}`}>{formatCurrency(latestFee.balance || 0)}</p>
              </div>
            </div>
            {latestFee.feeStatus === "PAID" && latestFee.paymentDate && (
              <p className="text-xs text-ink-500">Paid on {formatDate(latestFee.paymentDate)}</p>
            )}
            {latestFee.feeStatus !== "PAID" && latestFee.dueDate && (
              <p className="text-xs text-ink-500">Due by {formatDate(latestFee.dueDate)}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-400">No fee record yet for this student.</p>
        )}
      </div>

      {sortedFees.length > 1 && (
        <div className="rounded-xl border border-ink-700 p-4 mb-4">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Receipt size={13} /> Payment history
          </p>
          <div className="space-y-2">
            {sortedFees.slice(1).map((f) => (
              <div key={f.feeId} className="flex items-center justify-between text-sm">
                <span className="text-ink-300">{monthIdToLabel(f.monthId)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-ink-100">{formatCurrency(f.Receive || 0)}</span>
                  <Badge tone={f.feeStatus === "PAID" ? "success" : f.feeStatus === "PARTIAL" ? "warning" : "danger"} className="text-xs">
                    {f.feeStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-ink-700 p-4">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Calendar size={13} /> Notes
        </p>
        <p className="text-sm text-ink-400">No notes added yet for this student.</p>
      </div>
    </Drawer>
  );
}
