import { useEffect, useState, useCallback } from "react";
import { User, Layers, Clock, Armchair, CheckCircle2, ChevronRight, AlertCircle, RotateCcw, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Select, Label, Input } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { getAllStudents, getAllPlans } from "../../api/libraryAdminApi";
import { useNavigate } from "react-router-dom";
import { getSlotsByPlan } from "../../api/slotApi";
import {
  getAvailableSeatsForSlot, getAvailableSeatsForFlex,
  allocateFixed, allocateFlexible,
} from "../../api/seatApi";
import { getMyLibrary } from "../../api/librarySettingsApi";

const STEPS = [
  { id: 1, label: "Student", icon: User },
  { id: 2, label: "Plan", icon: Layers },
  { id: 3, label: "Time / Slot", icon: Clock },
  { id: 4, label: "Select Seat", icon: Armchair },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, idx) => {
        const Icon = s.icon;
        const done = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={clsx(
                "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                done ? "bg-amber-400 border-amber-400 text-white" :
                active ? "border-amber-400 text-amber-400 bg-amber-400/10" :
                "border-ink-600 text-ink-500 bg-ink-800"
              )}>
                {done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span className={clsx("text-xs font-medium hidden sm:block", active ? "text-amber-300" : done ? "text-ink-300" : "text-ink-500")}>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={clsx("h-px flex-1 mx-2 transition-all", done ? "bg-amber-400" : "bg-ink-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeatGrid({ seats, selected, onSelect }) {
  if (seats.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-700 p-8 text-center">
        <Armchair size={32} className="text-ink-500 mx-auto mb-3" />
        <p className="text-sm text-ink-400">No available seats for this selection.</p>
      </div>
    );
  }

  const grouped = {};
  seats.forEach(s => {
    const k = s.location || "General";
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(s);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([loc, seatList]) => (
        <div key={loc}>
          <p className="text-xs font-medium text-ink-400 mb-2">{loc}</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {seatList.map(seat => (
              <motion.button
                key={seat.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(seat)}
                className={clsx(
                  "aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-all",
                  selected?.id === seat.id
                    ? "bg-amber-400 border-amber-400 text-white shadow-[var(--shadow-glow-amber)]"
                    : "bg-success-soft border-success/30 text-success hover:border-success"
                )}
              >
                <Armchair size={16} />
                <span className="truncate max-w-full px-0.5">{seat.seatName}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SeatAllocation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [library, setLibrary] = useState(null);
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [slots, setSlots] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [flexStart, setFlexStart] = useState("");
  const [flexEnd, setFlexEnd] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [loadingSeats, setLoadingSeats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [alreadyAllocatedModal, setAlreadyAllocatedModal] = useState(false);

  const isFixed = library?.allocationMode === "FIXED_HOUR";

  useEffect(() => {
    Promise.allSettled([getMyLibrary(), getAllStudents(), getAllPlans()])
      .then(([lib, stud, plan]) => {
        if (lib.status === "fulfilled") setLibrary(lib.value.data);
        if (stud.status === "fulfilled") setStudents(stud.value.data || []);
        if (plan.status === "fulfilled") setPlans(plan.value.data || []);
      });
  }, []);

  // Load slots when plan changes in fixed mode
  useEffect(() => {
    if (isFixed && selectedPlan) {
      getSlotsByPlan(selectedPlan.id)
        .then(r => setSlots(r.data || []))
        .catch(() => setSlots([]));
    } else {
      setSlots([]);
    }
  }, [selectedPlan, isFixed]);

  const checkStudentActive = (student) => {
    if (student?.seat) {
      setStudentError(`${student.fullName} already has an active seat (${student.seat.seatName}). Please deallocate first.`);
    } else {
      setStudentError(null);
    }
  };

  const fetchAvailableSeats = useCallback(async () => {
    setLoadingSeats(true);
    setAvailableSeats([]);
    setSelectedSeat(null);
    try {
      let res;
      if (isFixed) {
        if (!selectedSlot) throw new Error("Select a slot first");
        res = await getAvailableSeatsForSlot(selectedSlot.id);
      } else {
        if (!flexStart || !flexEnd) throw new Error("Select start and end time");
        res = await getAvailableSeatsForFlex(flexStart, flexEnd);
      }
      const seats = res.data || [];
      setAvailableSeats(seats);
      if (seats.length === 0) toast("No available seats for this selection", { icon: "ℹ️" });
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data || err.message || "Failed to check availability");
    } finally {
      setLoadingSeats(false);
    }
  }, [isFixed, selectedSlot, flexStart, flexEnd]);

  const handleAllocate = async () => {
    if (!selectedSeat) return toast.error("Select a seat");
    setSaving(true);
    try {
      if (isFixed) {
        await allocateFixed(selectedStudent.id, selectedSeat.id, selectedPlan.id, selectedSlot.id);
      } else {
        await allocateFlexible(selectedStudent.id, selectedSeat.id, selectedPlan.id, flexStart, flexEnd);
      }
      toast.success(`Seat ${selectedSeat.seatName} allocated to ${selectedStudent.fullName}`);
      handleReset();
    } catch (err) {
      const errMsg = err.response?.data || err.message || "Allocation failed";
      if (typeof errMsg === "string" && errMsg.includes("ALREADY_ALLOCATED")) {
        setAlreadyAllocatedModal(true);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedStudent(null);
    setSelectedPlan(null);
    setSelectedSlot(null);
    setFlexStart("");
    setFlexEnd("");
    setSelectedSeat(null);
    setAvailableSeats([]);
    setStudentError(null);
  };

  const canStep2 = selectedStudent && !studentError;
  const canStep3 = canStep2 && selectedPlan;
  const canCheckAvailability = canStep3 && (isFixed ? selectedSlot : flexStart && flexEnd);

  // Flex duration validation
  const flexDurationValid = (() => {
    if (!flexStart || !flexEnd || !selectedPlan) return null;
    const [sh, sm] = flexStart.split(":").map(Number);
    const [eh, em] = flexEnd.split(":").map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    // Use hoursPerDay (study hours) not duration (subscriptionDays) for validation
    const expectedHours = selectedPlan.hoursPerDay ?? selectedPlan.duration;
    return { actual: diff / 60, expected: expectedHours, ok: Math.abs(diff / 60 - expectedHours) < 0.01 };
  })();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink-50">Seat Allocation</h2>
          <p className="text-sm text-ink-400 mt-0.5">
            Mode: <Badge tone={isFixed ? "amber" : "info"} className="ml-1">{isFixed ? "Fixed Hour" : "Flexible Hour"}</Badge>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleReset}><RotateCcw size={14} /> Reset</Button>
      </div>

      <StepIndicator current={step} />

      <AnimatePresence mode="wait">

        {/* STEP 1 — Student */}
        <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-semibold">1</span>
                <p className="font-medium text-ink-100">Select Student</p>
              </div>
              <div>
                <Label required>Student</Label>
                <Select
                  value={selectedStudent?.id || ""}
                  onChange={e => {
                    const s = students.find(x => String(x.id) === e.target.value);
                    setSelectedStudent(s || null);
                    checkStudentActive(s);
                    setSelectedPlan(null); setSelectedSlot(null); setFlexStart(""); setFlexEnd(""); setAvailableSeats([]); setStep(1);
                  }}
                >
                  <option value="">Choose a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName} {s.seat ? "⚠ (has seat)" : ""}</option>)}
                </Select>
              </div>
              {studentError && (
                <div className="flex gap-2 items-start rounded-xl bg-danger-soft border border-danger/30 p-3 text-sm text-danger">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {studentError}
                </div>
              )}
              {selectedStudent && !studentError && (
                <div className="rounded-xl bg-success-soft border border-success/30 p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-success/20 flex items-center justify-center text-sm font-semibold text-success">
                    {selectedStudent.fullName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm text-ink-100 font-medium">{selectedStudent.fullName}</p>
                    <p className="text-xs text-ink-400">{selectedStudent.phone || selectedStudent.email}</p>
                  </div>
                </div>
              )}
              {canStep2 && step === 1 && (
                <Button className="w-full" onClick={() => setStep(2)}>
                  Continue to Plan <ChevronRight size={15} />
                </Button>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* STEP 2 — Plan */}
        {step >= 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-semibold">2</span>
                  <p className="font-medium text-ink-100">Select Plan</p>
                </div>
                <div>
                  <Label required>Plan</Label>
                  <Select
                    value={selectedPlan?.id || ""}
                    onChange={e => {
                      const p = plans.find(x => String(x.id) === e.target.value);
                      setSelectedPlan(p || null);
                      setSelectedSlot(null); setFlexStart(""); setFlexEnd(""); setAvailableSeats([]); setStep(2);
                    }}
                  >
                    <option value="">Choose a plan...</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.hoursPerDay ?? p.duration}h/day — ₹{p.price}</option>)}
                  </Select>
                </div>
                {selectedPlan && (
                  <div className="rounded-xl border border-ink-700 p-3.5 grid grid-cols-3 gap-3 text-center">
                    <div><p className="text-xs text-ink-500">Name</p><p className="text-sm text-ink-100 font-medium">{selectedPlan.name}</p></div>
                    <div><p className="text-xs text-ink-500">Study Hours/Day</p><p className="text-sm text-ink-100 font-medium">{selectedPlan.hoursPerDay ?? selectedPlan.duration}h</p></div>
                    <div><p className="text-xs text-ink-500">Price</p><p className="text-sm text-ink-100 font-medium">₹{selectedPlan.price}</p></div>
                  </div>
                )}
                {canStep3 && step === 2 && (
                  <Button className="w-full" onClick={() => setStep(3)}>
                    Continue to {isFixed ? "Slot" : "Time"} <ChevronRight size={15} />
                  </Button>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* STEP 3 — Slot or Flex Time */}
        {step >= 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-semibold">3</span>
                  <p className="font-medium text-ink-100">{isFixed ? "Select Slot" : "Select Time Range"}</p>
                </div>

                {isFixed ? (
                  <>
                    {slots.length === 0 ? (
                      <div className="rounded-xl bg-warning-soft border border-warning/30 p-3 flex gap-2 text-sm text-warning items-center">
                        <AlertCircle size={15} />
                        No slots defined for this plan. Go to Slot Management to create slots.
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {slots.sort((a, b) => a.startTime?.localeCompare(b.startTime)).map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => { setSelectedSlot(slot); setAvailableSeats([]); setStep(3); }}
                            className={clsx(
                              "flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                              selectedSlot?.id === slot.id
                                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                                : "border-ink-700 hover:border-ink-500 text-ink-200"
                            )}
                          >
                            <div>
                              <p className="text-sm font-medium">{slot.slotName}</p>
                              <p className="text-xs text-ink-400 mt-0.5">{slot.startTime} — {slot.endTime} · {slot.durationHours}h</p>
                            </div>
                            {selectedSlot?.id === slot.id && <CheckCircle2 size={16} className="text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label required>Start Time</Label>
                        <Input type="time" value={flexStart} onChange={e => { setFlexStart(e.target.value); setAvailableSeats([]); }} />
                      </div>
                      <div>
                        <Label required>End Time</Label>
                        <Input type="time" value={flexEnd} onChange={e => { setFlexEnd(e.target.value); setAvailableSeats([]); }} />
                      </div>
                    </div>
                    {flexDurationValid !== null && (
                      <div className={clsx("rounded-xl p-3 text-sm flex items-center gap-2",
                        flexDurationValid.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                        <AlertCircle size={14} />
                        Duration: {flexDurationValid.actual.toFixed(1)}h — Plan requires: {flexDurationValid.expected}h
                        {flexDurationValid.ok ? " ✓ Match" : " ✗ Mismatch"}
                      </div>
                    )}
                  </>
                )}

                <Button
                  className="w-full"
                  onClick={fetchAvailableSeats}
                  loading={loadingSeats}
                  disabled={!canCheckAvailability || (flexDurationValid !== null && !flexDurationValid.ok)}
                >
                  <Armchair size={15} /> Check Available Seats
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* STEP 4 — Seat Selection */}
        {step >= 4 && (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-semibold">4</span>
                    <p className="font-medium text-ink-100">Select Available Seat</p>
                  </div>
                  <Badge tone="success">{availableSeats.length} available</Badge>
                </div>

                <SeatGrid seats={availableSeats} selected={selectedSeat} onSelect={setSelectedSeat} />

                {selectedSeat && (
                  <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
                    <p className="text-sm text-ink-400 mb-3">Allocation Summary</p>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex gap-2"><User size={14} className="text-ink-400 mt-0.5" /><span className="text-ink-200">{selectedStudent?.fullName}</span></div>
                      <div className="flex gap-2"><Armchair size={14} className="text-ink-400 mt-0.5" /><span className="text-ink-200">{selectedSeat.seatName} · {selectedSeat.location}</span></div>
                      <div className="flex gap-2"><Layers size={14} className="text-ink-400 mt-0.5" /><span className="text-ink-200">{selectedPlan?.name}</span></div>
                      <div className="flex gap-2"><Clock size={14} className="text-ink-400 mt-0.5" /><span className="text-ink-200">
                        {isFixed ? `${selectedSlot?.slotName} (${selectedSlot?.startTime} — ${selectedSlot?.endTime})` : `${flexStart} — ${flexEnd}`}
                      </span></div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleAllocate} loading={saving}>
                      <CheckCircle2 size={15} /> Confirm Allocation
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Already Allocated Popup */}
      <Modal
        open={alreadyAllocatedModal}
        onClose={() => setAlreadyAllocatedModal(false)}
        title="Student Already Allocated"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="secondary" className="flex-1" onClick={() => setAlreadyAllocatedModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => { setAlreadyAllocatedModal(false); navigate("/admin/allocations"); }}>
              Go to Deallocate
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-danger-soft border border-danger/30 p-4">
            <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-ink-100 font-medium">
                {selectedStudent?.fullName} is already allocated to this seat/slot.
              </p>
              <p className="text-xs text-ink-400 mt-1">
                A student can only have one seat and one slot in a library. Please deallocate the existing allocation before assigning a new one.
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-500 text-center">
            Click "Go to Deallocate" to manage active allocations.
          </p>
        </div>
      </Modal>
    </div>
  );
}
