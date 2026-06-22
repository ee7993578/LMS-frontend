import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Clock, User, CalendarClock, Plus, Trash2, X } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Select, Label, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import {
  allocateFixed,
  allocateFlexible,
  deallocateSeat,
  deallocateByAllocationId,
  updateSeat,
  deleteSeat,
  getSeatAllocations,
} from "../../api/seatApi";
import { getAllStudents, getAllPlans } from "../../api/libraryAdminApi";
import { getSlotsByPlan } from "../../api/slotApi";

function fmt(t) {
  if (!t) return "—";
  // t is "HH:mm:ss" or "HH:mm"
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function AllocationBadge({ alloc }) {
  const isFixed = alloc.allocationMode === "FIXED_HOUR";
  return (
    <div className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-800/60 px-3 py-2.5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <User size={14} className="text-ink-400 shrink-0" />
        <span className="text-sm text-ink-100 font-medium truncate">{alloc.studentName}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-ink-400">
          {isFixed
            ? `${alloc.slotName || "Slot"}: ${fmt(alloc.slotStart)} – ${fmt(alloc.slotEnd)}`
            : `Flex: ${fmt(alloc.flexStartTime)} – ${fmt(alloc.flexEndTime)}`}
        </span>
        <Badge tone={isFixed ? "info" : "warning"} className="text-[10px]">
          {isFixed ? "Fixed" : "Flexible"}
        </Badge>
      </div>
    </div>
  );
}

export default function SeatActionModal({ open, onClose, seat, onChanged }) {
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Allocation form state
  const [mode, setMode] = useState("FIXED"); // "FIXED" | "FLEXIBLE"
  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Tab
  const [tab, setTab] = useState("info"); // "info" | "allocate"

  useEffect(() => {
    if (!open || !seat) return;
    setTab("info");
    setStudentId(""); setPlanId(""); setSlotId(""); setStartTime(""); setEndTime("");
    setMode("FIXED");
    setSlots([]);

    setLoading(true);
    Promise.all([
      getAllStudents(),
      getAllPlans(),
      getSeatAllocations(seat.id),
    ])
      .then(([sRes, pRes, aRes]) => {
        setStudents(sRes.data || []);
        setPlans(pRes.data || []);
        setAllocations(aRes.data || []);
      })
      .catch(() => toast.error("Failed to load seat details"))
      .finally(() => setLoading(false));
  }, [open, seat]);

  // Load slots when plan changes (for FIXED mode)
  useEffect(() => {
    if (!planId || mode !== "FIXED") { setSlots([]); setSlotId(""); return; }
    getSlotsByPlan(planId)
      .then(({ data }) => setSlots(data || []))
      .catch(() => setSlots([]));
  }, [planId, mode]);

  if (!seat) return null;

  // Which slots are already taken for this seat?
  const takenSlotIds = new Set(allocations.filter((a) => a.slotId).map((a) => a.slotId));

  // Compute occupied time ranges for display
  const freeSlots = slots.filter((s) => !takenSlotIds.has(s.id));

  const handleAllocate = async () => {
    if (!studentId || !planId) return toast.error("Choose a student and a plan");
    if (mode === "FIXED" && !slotId) return toast.error("Choose a slot for fixed mode");
    if (mode === "FLEXIBLE" && (!startTime || !endTime))
      return toast.error("Enter start and end time for flexible mode");
    if (mode === "FLEXIBLE" && startTime >= endTime)
      return toast.error("Start time must be before end time");

    setSaving(true);
    try {
      if (mode === "FIXED") {
        await allocateFixed(Number(studentId), seat.id, Number(planId), Number(slotId));
      } else {
        await allocateFlexible(Number(studentId), seat.id, Number(planId), startTime, endTime);
      }
      toast.success("Seat allocated successfully");
      onChanged();
    } catch (err) {
      toast.error(err.response?.data || err.message || "Failed to allocate seat");
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocateStudent = async (studentIdToDeallocate) => {
    setSaving(true);
    try {
      await deallocateSeat(studentIdToDeallocate);
      toast.success("Allocation removed");
      onChanged();
    } catch {
      toast.error("Failed to deallocate");
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocateAllocation = async (allocId) => {
    setSaving(true);
    try {
      await deallocateByAllocationId(allocId);
      toast.success("Allocation removed");
      onChanged();
    } catch {
      toast.error("Failed to deallocate");
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    setSaving(true);
    try {
      const newStatus = seat.status === "UNDER_MAINTENANCE" ? "AVAILABLE" : "UNDER_MAINTENANCE";
      await updateSeat(seat.id, { ...seat, status: newStatus });
      toast.success(newStatus === "UNDER_MAINTENANCE" ? "Marked under maintenance" : "Seat restored");
      onChanged();
    } catch {
      toast.error("Failed to update seat");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete seat "${seat.seatName}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteSeat(seat.id);
      toast.success("Seat removed");
      onChanged();
    } catch {
      toast.error("Failed to delete seat");
    } finally {
      setSaving(false);
    }
  };

  const isUnderMaintenance = seat.status === "UNDER_MAINTENANCE";

  return (
    <Modal open={open} onClose={onClose} title={`Seat ${seat.seatName}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-400">{seat.location}</p>
        <Badge tone={STATUS_TONE[seat.status]}>{seat.status?.replace(/_/g, " ")}</Badge>
      </div>

      {/* Tabs */}
      {!isUnderMaintenance && (
        <div className="flex gap-1 mb-5 bg-ink-800 rounded-lg p-1">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
              tab === "info"
                ? "bg-ink-700 text-ink-100 font-medium"
                : "text-ink-400 hover:text-ink-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <CalendarClock size={14} /> Schedule
            </span>
          </button>
          <button
            onClick={() => setTab("allocate")}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
              tab === "allocate"
                ? "bg-ink-700 text-ink-100 font-medium"
                : "text-ink-400 hover:text-ink-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus size={14} /> Allocate
            </span>
          </button>
        </div>
      )}

      {/* MAINTENANCE */}
      {isUnderMaintenance && (
        <div className="space-y-4">
          <p className="text-sm text-ink-400">
            This seat is under maintenance and cannot be allocated.
          </p>
          <Button className="w-full" onClick={handleMaintenanceToggle} loading={saving}>
            Mark as Available
          </Button>
        </div>
      )}

      {/* INFO / SCHEDULE TAB */}
      {!isUnderMaintenance && tab === "info" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-ink-800 animate-pulse" />
              ))}
            </div>
          ) : allocations.length === 0 ? (
            <div className="rounded-xl border border-ink-700 p-6 text-center">
              <Clock size={24} className="mx-auto text-ink-500 mb-2" />
              <p className="text-sm text-ink-400">No active allocations</p>
              <p className="text-xs text-ink-500 mt-1">This seat is currently free</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-ink-500 uppercase tracking-wide font-medium">
                Active Allocations ({allocations.length})
              </p>
              {allocations.map((alloc) => (
                <div key={alloc.id} className="relative group">
                  <AllocationBadge alloc={alloc} />
                  <button
                    onClick={() => handleDeallocateAllocation(alloc.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-md bg-danger-soft text-danger flex items-center justify-center hover:bg-danger hover:text-white"
                    title="Remove this allocation"
                    disabled={saving}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-ink-700">
            <Button
              variant="secondary"
              className="flex-1 text-xs"
              onClick={handleMaintenanceToggle}
              loading={saving}
            >
              Mark Maintenance
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={handleDelete}
              loading={saving}
            >
              Delete Seat
            </Button>
          </div>
        </div>
      )}

      {/* ALLOCATE TAB */}
      {!isUnderMaintenance && tab === "allocate" && (
        <div className="space-y-4">
          {/* Mode toggle */}
          <div>
            <Label>Allocation Mode</Label>
            <div className="flex gap-2 mt-1">
              {["FIXED", "FLEXIBLE"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    mode === m
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-medium"
                      : "border-ink-700 bg-ink-800 text-ink-400 hover:border-ink-500"
                  }`}
                >
                  {m === "FIXED" ? "⏱ Fixed Slot" : "🕐 Flexible Hours"}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-500 mt-1.5">
              {mode === "FIXED"
                ? "Assign student to a predefined time slot linked to a plan"
                : "Define a custom start–end time window for the student"}
            </p>
          </div>

          <div>
            <Label required>Student</Label>
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Choose a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                  {s.email ? ` (${s.email})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label required>Plan</Label>
            <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Choose a plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price}
                </option>
              ))}
            </Select>
          </div>

          {mode === "FIXED" && (
            <div>
              <Label required>Slot</Label>
              {planId && slots.length === 0 ? (
                <p className="text-xs text-ink-500 mt-1 px-1">
                  No slots found for this plan. Create slots in Slot Management.
                </p>
              ) : (
                <Select value={slotId} onChange={(e) => setSlotId(e.target.value)} disabled={!planId}>
                  <option value="">
                    {!planId ? "Select a plan first" : "Choose a slot"}
                  </option>
                  {slots.map((s) => {
                    const taken = takenSlotIds.has(s.id);
                    return (
                      <option key={s.id} value={s.id} disabled={taken}>
                        {s.slotName}: {fmt(s.startTime)} – {fmt(s.endTime)}
                        {taken ? " (Occupied)" : " (Free)"}
                      </option>
                    );
                  })}
                </Select>
              )}
              {slots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {slots.map((s) => {
                    const taken = takenSlotIds.has(s.id);
                    return (
                      <span
                        key={s.id}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          taken
                            ? "border-danger/30 bg-danger-soft text-danger"
                            : "border-success/30 bg-success-soft text-success"
                        }`}
                      >
                        {s.slotName}: {fmt(s.startTime)}–{fmt(s.endTime)}
                        {taken ? " 🔴" : " 🟢"}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {mode === "FLEXIBLE" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label required>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleAllocate} loading={saving}>
            Allocate Seat
          </Button>
        </div>
      )}
    </Modal>
  );
}
