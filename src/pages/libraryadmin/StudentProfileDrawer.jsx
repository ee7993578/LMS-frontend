import { Drawer } from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { initials } from "../../utils/format";
import { Mail, Phone, Armchair, Layers, Calendar } from "lucide-react";

export default function StudentProfileDrawer({ open, onClose, student }) {
  if (!student) return null;

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
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">Fee summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-500 text-xs">Plan price</p>
            <p className="text-ink-100 font-medium">₹{student.plan?.price || 0}</p>
          </div>
          <div>
            <p className="text-ink-500 text-xs">Duration</p>
            <p className="text-ink-100 font-medium">{student.plan?.duration || "—"} days</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-ink-700 p-4">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Calendar size={13} /> Notes
        </p>
        <p className="text-sm text-ink-400">No notes added yet for this student.</p>
      </div>
    </Drawer>
  );
}
