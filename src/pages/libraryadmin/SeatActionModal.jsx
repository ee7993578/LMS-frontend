import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Clock, User, CalendarClock, Plus, X, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
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
  getActiveAllocations,
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

// Check if two time ranges overlap (handles midnight-crossing slots)
function timesOverlap(s1, e1, s2, e2) {
  // Convert "HH:MM" to minutes
  const toMins = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const s1m = toMins(s1), e1m = toMins(e1), s2m = toMins(s2), e2m = toMins(e2);

  // Expand midnight-crossing slot into two segments: [start, 1440] + [0, end]
  // A slot crosses midnight if end <= start (e.g. 18:00 -> 06:00)
  const expandSlot = (sm, em) => {
    if (em <= sm) {
      // crosses midnight: two segments
      return [[sm, 1440], [0, em]];
    }
    return [[sm, em]];
  };

  const segs1 = expandSlot(s1m, e1m);
  const segs2 = expandSlot(s2m, e2m);

  for (const [a, b] of segs1) {
    for (const [c, d] of segs2) {
      if (a < d && c < b) return true;
    }
  }
  return false;
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
  const [allActiveAllocations, setAllActiveAllocations] = useState([]); // all active allocs in library
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
    Promise.all([getAllStudents(), getAllPlans(), getSeatAllocations(seat.id), getAllSlots(), getActiveAllocations()])
      .then(([sRes, pRes, aRes, slotRes, activeRes]) => {
        setStudents(sRes.data || []);
        setPlans(pRes.data || []);
        setAllocations(aRes.data || []);
        setAllSlots(slotRes.data || []);
        setAllActiveAllocations(activeRes.data || []);
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

  // Taken slot IDs on this seat (by any student)
  const takenSlotIds = new Set(allocations.filter((a) => a.slotId).map((a) => a.slotId));

  // Cross-plan conflict slot IDs: slots whose time overlaps with an already-occupied fixed slot on this seat
  // These slots are hidden everywhere (not available to allocate, not shown as occupied)
  const crossPlanConflictSlotIds = new Set(
    allSlots
      .filter((s) => {
        if (takenSlotIds.has(s.id)) return false; // already occupied — not a cross-plan conflict
        const slotS = s.startTime ? s.startTime.substring(0, 5) : null;
        const slotE = s.endTime ? s.endTime.substring(0, 5) : null;
        if (!slotS || !slotE) return false;
        for (const alloc of allocations) {
          if (alloc.allocationMode === "FIXED_HOUR" && alloc.slotStart && alloc.slotEnd) {
            const occS = alloc.slotStart.substring(0, 5);
            const occE = alloc.slotEnd.substring(0, 5);
            if (timesOverlap(slotS, slotE, occS, occE)) return true;
          }
        }
        return false;
      })
      .map((s) => s.id)
  );

  // Set of student IDs that already have any active allocation (anywhere in library)
  const studentsWithActiveAlloc = new Set(allActiveAllocations.map((a) => a.studentId));

  // Selected student's existing allocation info (for warning)
  const selectedStudentExistingAlloc = studentId
    ? allActiveAllocations.find((a) => a.studentId === Number(studentId))
    : null;

  // Check if a slot conflicts with the selected student's existing allocation
  const slotConflictsWithStudent = (slot) => {
    if (!selectedStudentExistingAlloc) return false;
    // Student already has a seat — any slot would conflict
    return true;
  };

  // Check if a flex time conflicts with seat's existing allocations
  const getFlexConflictOnSeat = () => {
    if (!startTime || !endTime) return null;
    // Check against fixed slot allocations on this seat
    for (const alloc of allocations) {
      if (alloc.allocationMode === "FIXED_HOUR" && alloc.slotStart && alloc.slotEnd) {
        const slotS = alloc.slotStart.substring(0, 5);
        const slotE = alloc.slotEnd.substring(0, 5);
        if (timesOverlap(startTime, endTime, slotS, slotE)) {
          return `Conflicts with ${alloc.studentName}'s fixed slot (${fmt(slotS)} – ${fmt(slotE)})`;
        }
      }
      // Check against flex allocations on this seat
      if (alloc.allocationMode === "FLEXIBLE_HOUR" && alloc.flexStartTime && alloc.flexEndTime) {
        const flexS = alloc.flexStartTime.substring(0, 5);
        const flexE = alloc.flexEndTime.substring(0, 5);
        if (timesOverlap(startTime, endTime, flexS, flexE)) {
          return `Conflicts with ${alloc.studentName}'s flex time (${fmt(flexS)} – ${fmt(flexE)})`;
        }
      }
    }
    return null;
  };

  const flexConflict = getFlexConflictOnSeat();

  const handleAllocate = async () => {
    if (!studentId || !planId) return toast.error("Choose a student and a plan");
    if (mode === "FIXED" && !slotId) return toast.error("Choose a slot for fixed mode");
    if (mode === "FLEXIBLE" && (!startTime || !endTime)) return toast.error("Enter start and end time");
    if (mode === "FLEXIBLE" && startTime >= endTime) return toast.error("Start time must be before end time");

    // Frontend guard: student already has an allocation
    if (selectedStudentExistingAlloc) {
      toast.error(
        `${selectedStudentExistingAlloc.studentName} already has seat ${selectedStudentExistingAlloc.seatName} allocated. Deallocate first.`,
        { duration: 5000 }
      );
      return;
    }

    // Frontend guard: flex time conflict on seat
    if (mode === "FLEXIBLE" && flexConflict) {
      toast.error(flexConflict, { duration: 5000 });
      return;
    }

    setSaving(true);
    try {
      if (mode === "FIXED") {
        await allocateFixed(Number(studentId), seat.id, Number(planId), Number(slotId));
      } else {
        await allocateFlexible(Number(studentId), seat.id, Number(planId), startTime, endTime);
      }
      toast.success("Seat allocated successfully");
      setStudentId(""); setPlanId(""); setSlotId(""); setStartTime(""); setEndTime("");
      reload();
      onChanged();
    } catch (err) {
      const errMsg = err.response?.data || err.message || "Failed to allocate seat";
      if (typeof errMsg === "string" && errMsg.includes("ALREADY_ALLOCATED")) {
        toast.error("Student already has an active seat. Please deallocate first.", { duration: 5000 });
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

  // Slots breakdown: for each slot show if occupied, conflicted (hidden), or free on THIS seat
  // "conflicted" = slot's time overlaps with an already-occupied slot on this seat (cross-plan time clash)
  // Such slots are HIDDEN — not shown in occupied, not shown in available
  const slotBreakdown = allSlots.map((s) => {
    const fixedAlloc = allocations.find((a) => a.slotId === s.id && a.allocationMode === "FIXED_HOUR");
    if (fixedAlloc) {
      return { ...s, occupied: true, allocation: fixedAlloc, conflictReason: "fixed" };
    }
    // Check if any flex allocation on this seat overlaps with this slot's time
    const slotS = s.startTime ? s.startTime.substring(0, 5) : null;
    const slotE = s.endTime ? s.endTime.substring(0, 5) : null;
    if (slotS && slotE) {
      for (const alloc of allocations) {
        if (alloc.allocationMode === "FLEXIBLE_HOUR" && alloc.flexStartTime && alloc.flexEndTime) {
          const flexS = alloc.flexStartTime.substring(0, 5);
          const flexE = alloc.flexEndTime.substring(0, 5);
          if (timesOverlap(slotS, slotE, flexS, flexE)) {
            return { ...s, occupied: true, allocation: alloc, conflictReason: "flex-overlap", flexAlloc: alloc };
          }
        }
      }
      // Check if this slot's time overlaps with any OTHER already-occupied fixed slot on this seat
      // (cross-plan conflict: e.g. Basic Night 00:00-06:00 occupied → Standard Afternoon 18:00-06:00 overlaps)
      for (const alloc of allocations) {
        if (alloc.allocationMode === "FIXED_HOUR" && alloc.slotId !== s.id && alloc.slotStart && alloc.slotEnd) {
          const occS = alloc.slotStart.substring(0, 5);
          const occE = alloc.slotEnd.substring(0, 5);
          if (timesOverlap(slotS, slotE, occS, occE)) {
            // This slot conflicts with an occupied slot — hide it completely
            return { ...s, occupied: false, hidden: true, allocation: null, conflictReason: "cross-plan-overlap" };
          }
        }
      }
    }
    return { ...s, occupied: false, hidden: false, allocation: null };
  });

  const flexAllocations = allocations.filter((a) => a.allocationMode === "FLEXIBLE_HOUR");
  const fixedAllocations = allocations.filter((a) => a.allocationMode === "FIXED_HOUR");
  // hidden=true slots are completely excluded (cross-plan time conflict) — show neither in occupied nor available
  const freeSlots = slotBreakdown.filter((s) => !s.occupied && !s.hidden);
  const occupiedSlots = slotBreakdown.filter((s) => s.occupied && !s.hidden);

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
                            <p className="text-xs font-medium text-ink-100">{s.allocation?.planName} - {s.slotName}</p>
                            <p className="text-[10px] text-ink-500">{fmt(s.startTime)} – {fmt(s.endTime)}</p>
                            {s.conflictReason === "flex-overlap" && (
                              <p className="text-[10px] text-warning">⚡ Blocked by flex allocation</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {s.allocation && (
                            <>
                              <p className="text-xs text-ink-300">{s.allocation.studentName}</p>
                              {s.conflictReason === "flex-overlap" && (
                                <p className="text-[10px] text-warning">{fmt(s.flexAlloc?.flexStartTime)} – {fmt(s.flexAlloc?.flexEndTime)}</p>
                              )}
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

              {/* Available (free) slots */}
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
                            <p className="text-xs font-medium text-ink-100">{s.planName} - {s.slotName}</p>
                            <p className="text-[10px] text-ink-500">{fmt(s.startTime)} – {fmt(s.endTime)} · {s.durationHours}h</p>
                          </div>
                        </div>
                        <div className="text-right">
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
              Each student can only hold <span className="text-ink-200">one active seat</span> at a time.
              One seat can have multiple students on <span className="text-ink-200">different non-overlapping slots</span>.
            </p>
          </div>

          {/* Mode toggle */}
          <div>
            <Label>Allocation Mode</Label>
            <div className="flex gap-2 mt-1">
              {["FIXED", "FLEXIBLE"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setSlotId(""); setStartTime(""); setEndTime(""); }}
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
              {students.map((s) => {
                const hasAlloc = studentsWithActiveAlloc.has(s.id);
                return (
                  <option key={s.id} value={s.id}>
                    {s.fullName}{s.email ? ` (${s.email})` : ""}{hasAlloc ? " ⚠ (has seat)" : ""}
                  </option>
                );
              })}
            </Select>
            {/* Warning if selected student already has a seat */}
            {selectedStudentExistingAlloc && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-danger-soft border border-danger/30 px-3 py-2">
                <AlertCircle size={13} className="text-danger mt-0.5 shrink-0" />
                <p className="text-xs text-danger">
                  This student already has seat <strong>{selectedStudentExistingAlloc.seatName}</strong> allocated.
                  Deallocate that seat first before assigning a new one.
                </p>
              </div>
            )}
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
                  {slots
                    .filter((s) => !crossPlanConflictSlotIds.has(s.id))
                    .map((s) => {
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
                  {slots
                    .filter((s) => !crossPlanConflictSlotIds.has(s.id))
                    .map((s) => {
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
            <div className="space-y-3">
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
              {/* Show conflict warning for flex time on this seat */}
              {flexConflict && (
                <div className="flex items-start gap-2 rounded-lg bg-danger-soft border border-danger/30 px-3 py-2">
                  <AlertCircle size={13} className="text-danger mt-0.5 shrink-0" />
                  <p className="text-xs text-danger">{flexConflict}</p>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleAllocate}
            loading={saving}
            disabled={!!selectedStudentExistingAlloc || (mode === "FLEXIBLE" && !!flexConflict)}
          >
            Allocate Seat
          </Button>
        </div>
      )}
    </Modal>
  );
}
