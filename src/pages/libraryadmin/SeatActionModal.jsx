import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Clock, User, CalendarClock, Plus, X, CheckCircle2, XCircle, Info } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Select, Label, Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import {
  allocateFixed,
  allocateFlexible,
  deallocateByAllocationId,
  updateSeat,
  deleteSeat,
  getSeatAllocations,
} from "../../api/seatApi";
import { getAllStudents, getAllPlans } from "../../api/libraryAdminApi";
import { getSlotsByPlan, getAllSlots } from "../../api/slotApi";

function fmt(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

// Shows one active allocation row with deallocate button
function AllocationRow({ alloc, onDeallocate, saving }) {
  const isFixed = alloc.allocationMode === "FIXED_HOUR";
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800/70 px-3 py-3 gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <User size={13} className="text-ink-400 shrink-0" />
          <span className="text-sm text-ink-100 font-medium truncate">{alloc.studentName}</span>
          <Badge tone={isFixed ? "info" : "warning"} className="text-[10px] ml-auto shrink-0">
            {isFixed ? "Fixed" : "Flex"}
          </Badge>
        </div>
        <p className="text-xs text-ink-400 pl-5">
          {isFixed
            ? <><span className="text-ink-300">{alloc.slotName || "Slot"}</span>: {fmt(alloc.slotStart)} – {fmt(alloc.slotEnd)}</>
            : <>Flex: {fmt(alloc.flexStartTime)} – {fmt(alloc.flexEndTime)}</>
          }
        </p>
        <p className="text-xs text-ink-500 pl-5 mt-0.5">Plan: {alloc.planName}</p>
      </div>
      <button
        onClick={() => onDeallocate(alloc.id)}
        disabled={saving}
        className="h-7 w-7 rounded-lg bg-danger-soft text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        title="Remove allocation"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function SeatActionModal({ open, onClose, seat, onChanged }) {
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [slots, setSlots] = useState([]); // for allocate tab (filtered by plan)
  const [allSlots, setAllSlots] = useState([]); // for info tab (all slots of this library)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState("FIXED");
  const [studentId, setStudentId] = useState("");
  const [planId, setPlanId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tab, setTab] = useState("info");

  const reload = () => {
    setLoading(true);
    Promise.all([getAllStudents(), getAllPlans(), getSeatAllocations(seat.id), getAllSlots()])
      .then(([sRes, pRes, aRes, slotRes]) => {
        setStudents(sRes.data || []);
        setPlans(pRes.data || []);
        setAllocations(aRes.data || []);
        setAllSlots(slotRes.data || []);
      })
      .catch(() => toast.error("Failed to load seat details"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !seat) return;
    setTab("info");
    setStudentId(""); setPlanId(""); setSlotId(""); setStartTime(""); setEndTime("");
    setMode("FIXED"); setSlots([]);
    reload();
  }, [open, seat]);

  useEffect(() => {
    if (!planId || mode !== "FIXED") { setSlots([]); setSlotId(""); return; }
    getSlotsByPlan(planId)
      .then(({ data }) => setSlots(data || []))
      .catch(() => setSlots([]));
  }, [planId, mode]);

  if (!seat) return null;

  // Taken slot IDs on this seat
  const takenSlotIds = new Set(allocations.filter((a) => a.slotId).map((a) => a.slotId));

  // Occupied students (unique)
  const occupiedStudents = allocations.map((a) => ({
    id: a.studentId,
    name: a.studentName,
  }));

  const handleAllocate = async () => {
    if (!studentId || !planId) return toast.error("Choose a student and a plan");
    if (mode === "FIXED" && !slotId) return toast.error("Choose a slot for fixed mode");
    if (mode === "FLEXIBLE" && (!startTime || !endTime)) return toast.error("Enter start and end time");
    if (mode === "FLEXIBLE" && startTime >= endTime) return toast.error("Start time must be before end time");

    setSaving(true);
    try {
      if (mode === "FIXED") {
        await allocateFixed(Number(studentId), seat.id, Number(planId), Number(slotId));
      } else {
        await allocateFlexible(Number(studentId), seat.id, Number(planId), startTime, endTime);
      }
      toast.success("Seat allocated successfully");
      reload();
      onChanged();
    } catch (err) {
      const errMsg = err.response?.data || err.message || "Failed to allocate seat";
      if (typeof errMsg === "string" && errMsg.includes("ALREADY_ALLOCATED")) {
        toast.error("Student already has an active allocation on this seat/slot. Please deallocate first.", { duration: 5000 });
      } else {
        toast.error(errMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeallocateAllocation = async (allocId) => {
    setSaving(true);
    try {
      await deallocateByAllocationId(allocId);
      toast.success("Allocation removed");
      reload();
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

  // Slots breakdown: for each slot show if occupied or free
  // Use allSlots (all library slots) for the info tab breakdown
  const slotBreakdown = allSlots.map((s) => ({
    ...s,
    occupied: takenSlotIds.has(s.id),
    allocation: allocations.find((a) => a.slotId === s.id),
  }));
  const flexAllocations = allocations.filter((a) => a.allocationMode === "FLEXIBLE_HOUR");
  const fixedAllocations = allocations.filter((a) => a.allocationMode === "FIXED_HOUR");
  const freeSlots = slotBreakdown.filter((s) => !s.occupied);
  const occupiedSlots = slotBreakdown.filter((s) => s.occupied);

  return (
    <Modal open={open} onClose={onClose} title={`Seat ${seat.seatName}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-400 flex items-center gap-1.5">
          <span className="text-ink-500">📍</span> {seat.location}
        </p>
        <Badge tone={STATUS_TONE[seat.status]}>{seat.status?.replace(/_/g, " ")}</Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg bg-ink-800 border border-ink-700 p-2.5 text-center">
          <p className="text-lg font-display text-info">{occupiedSlots.length + flexAllocations.length}</p>
          <p className="text-[10px] text-ink-500 uppercase tracking-wide">Occupied</p>
        </div>
        <div className="rounded-lg bg-ink-800 border border-ink-700 p-2.5 text-center">
          <p className="text-lg font-display text-success">{freeSlots.length}</p>
          <p className="text-[10px] text-ink-500 uppercase tracking-wide">Available Slots</p>
        </div>
      </div>

      {/* Tabs */}
      {!isUnderMaintenance && (
        <div className="flex gap-1 mb-5 bg-ink-800 rounded-lg p-1">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
              tab === "info" ? "bg-ink-700 text-ink-100 font-medium" : "text-ink-400 hover:text-ink-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <CalendarClock size={14} /> Schedule
            </span>
          </button>
          <button
            onClick={() => setTab("allocate")}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
              tab === "allocate" ? "bg-ink-700 text-ink-100 font-medium" : "text-ink-400 hover:text-ink-200"
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
          <p className="text-sm text-ink-400">This seat is under maintenance and cannot be allocated.</p>
          <Button className="w-full" onClick={handleMaintenanceToggle} loading={saving}>Mark as Available</Button>
        </div>
      )}

      {/* INFO / SCHEDULE TAB */}
      {!isUnderMaintenance && tab === "info" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-ink-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Occupied slots — show student + plan details */}
              {occupiedSlots.length > 0 && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide font-medium mb-2">Occupied slots</p>
                  <div className="space-y-1.5">
                    {occupiedSlots.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger-soft/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle size={14} className="text-danger shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-ink-100">{s.slotName}</p>
                            <p className="text-[10px] text-ink-500">{fmt(s.startTime)} – {fmt(s.endTime)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {s.allocation && (
                            <>
                              <p className="text-xs text-ink-300">{s.allocation.studentName}</p>
                              <p className="text-[10px] text-ink-500">{s.allocation.planName}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flex allocations — show in occupied section too */}
              {flexAllocations.length > 0 && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide font-medium mb-2">Flexible allocations (occupied)</p>
                  <div className="space-y-2">
                    {flexAllocations.map((alloc) => (
                      <AllocationRow key={alloc.id} alloc={alloc} onDeallocate={handleDeallocateAllocation} saving={saving} />
                    ))}
                  </div>
                </div>
              )}

              {/* Available (free) slots — show which plan each slot belongs to */}
              {freeSlots.length > 0 && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide font-medium mb-2">Available slots</p>
                  <div className="space-y-1.5">
                    {freeSlots.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-success/30 bg-success-soft/20 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-success shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-ink-100">{s.slotName}</p>
                            <p className="text-[10px] text-ink-500">{fmt(s.startTime)} – {fmt(s.endTime)} · {s.durationHours}h</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-ink-400">{s.planName}</p>
                          <p className="text-[10px] text-success">Open for booking</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fixed allocations manage — only for seats with no allSlots (legacy) */}
              {fixedAllocations.length > 0 && allSlots.length === 0 && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide font-medium mb-2">Fixed allocations ({fixedAllocations.length})</p>
                  <div className="space-y-2">
                    {fixedAllocations.map((alloc) => (
                      <AllocationRow key={alloc.id} alloc={alloc} onDeallocate={handleDeallocateAllocation} saving={saving} />
                    ))}
                  </div>
                </div>
              )}

              {allocations.length === 0 && allSlots.length === 0 && (
                <div className="rounded-xl border border-ink-700 p-6 text-center">
                  <Clock size={24} className="mx-auto text-ink-500 mb-2" />
                  <p className="text-sm text-ink-400">No active allocations</p>
                  <p className="text-xs text-ink-500 mt-1">This seat is currently open for all slots</p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-2 border-t border-ink-700">
            <Button variant="secondary" className="flex-1 text-xs" onClick={handleMaintenanceToggle} loading={saving}>
              Mark Maintenance
            </Button>
            <Button variant="outline" className="flex-1 text-xs" onClick={handleDelete} loading={saving}>
              Delete Seat
            </Button>
          </div>
        </div>
      )}

      {/* ALLOCATE TAB */}
      {!isUnderMaintenance && tab === "allocate" && (
        <div className="space-y-4">
          {/* Info: one student one seat rule */}
          <div className="flex items-start gap-2 rounded-lg bg-ink-800/60 border border-ink-700 px-3 py-2.5">
            <Info size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-ink-400">
              A student can only be on one seat at a time. If the student has another seat, it will be auto-deallocated.
              One seat can have multiple students on <span className="text-ink-200">different slots</span>.
            </p>
          </div>

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
          </div>

          <div>
            <Label required>Student</Label>
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Choose a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}{s.email ? ` (${s.email})` : ""}
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
                  <option value="">{!planId ? "Select a plan first" : "Choose a slot"}</option>
                  {slots.map((s) => {
                    const taken = takenSlotIds.has(s.id);
                    return (
                      <option key={s.id} value={s.id} disabled={taken}>
                        {s.slotName}: {fmt(s.startTime)} – {fmt(s.endTime)}
                        {taken ? " 🔴 Occupied" : " 🟢 Free"}
                      </option>
                    );
                  })}
                </Select>
              )}

              {/* Visual slot pills */}
              {slots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {slots.map((s) => {
                    const taken = takenSlotIds.has(s.id);
                    const allocation = allocations.find((a) => a.slotId === s.id);
                    return (
                      <button
                        key={s.id}
                        disabled={taken}
                        onClick={() => !taken && setSlotId(String(s.id))}
                        title={taken ? `Occupied by ${allocation?.studentName}` : "Click to select"}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                          String(slotId) === String(s.id)
                            ? "border-amber-400 bg-amber-400/15 text-amber-300"
                            : taken
                            ? "border-danger/30 bg-danger-soft/40 text-danger cursor-not-allowed"
                            : "border-success/30 bg-success-soft/20 text-success hover:bg-success-soft/40 cursor-pointer"
                        }`}
                      >
                        <span className="font-medium">{s.slotName}</span>
                        <span className="ml-1 opacity-70">{fmt(s.startTime)}–{fmt(s.endTime)}</span>
                        {taken && allocation && (
                          <span className="ml-1 text-[10px]">({allocation.studentName})</span>
                        )}
                      </button>
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
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label required>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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
