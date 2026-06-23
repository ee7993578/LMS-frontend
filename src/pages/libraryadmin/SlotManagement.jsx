import { useEffect, useState } from "react";
import { Plus, Clock, Trash2, Pencil, AlertCircle, ChevronDown, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Input, Label, Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState, SkeletonCard } from "../../components/ui/Feedback";
import Badge from "../../components/ui/Badge";
import { getAllPlans } from "../../api/libraryAdminApi";
import { getAllSlots, createSlot, updateSlot, deleteSlot, getSlotsByPlan, autoGenerateSlots } from "../../api/slotApi";
import { getMyLibrary } from "../../api/librarySettingsApi";

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

const EMPTY_FORM = { slotName: "", startTime: "", endTime: "", planId: "" };

export default function SlotManagement() {
  const [library, setLibrary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterPlan, setFilterPlan] = useState("ALL");
  const [autoGenerating, setAutoGenerating] = useState(false);

  const handleAutoGenerate = async (planId) => {
    const plan = plans.find(p => String(p.id) === String(planId));
    if (!plan) return;
    const hours = plan.hoursPerDay || plan.duration;
    if (!hours || 24 % hours !== 0) {
      return toast.error(`Study hours (${hours}h) must evenly divide 24 for auto-generation (e.g. 6, 8, 12, 24)`);
    }
    setAutoGenerating(true);
    try {
      const res = await autoGenerateSlots(planId);
      toast.success(`${res.data.length} slots auto-generated for ${plan.name}!`);
      load();
    } catch (err) {
      toast.error(err.response?.data || "Auto-generate failed");
    } finally {
      setAutoGenerating(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [libRes, planRes, slotRes] = await Promise.all([
        getMyLibrary(), getAllPlans(), getAllSlots(),
      ]);
      setLibrary(libRes.data);
      setPlans(planRes.data || []);
      setSlots(slotRes.data || []);
    } catch {
      toast.error("Failed to load slot data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (slot) => {
    setEditing(slot);
    setForm({
      slotName: slot.slotName,
      startTime: slot.startTime,
      endTime: slot.endTime,
      planId: String(slot.planId),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.slotName || !form.startTime || !form.endTime || !form.planId) {
      return toast.error("All fields are required");
    }
    setSaving(true);
    try {
      const payload = { ...form, planId: Number(form.planId) };
      if (editing) {
        await updateSlot(editing.id, payload);
        toast.success("Slot updated");
      } else {
        await createSlot(payload);
        toast.success("Slot created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data || err.message || "Failed to save slot");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSlot(id);
      toast.success("Slot deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data || "Failed to delete slot");
    }
  };

  const isFixed = library?.allocationMode === "FIXED_HOUR";

  const filtered = filterPlan === "ALL" ? slots : slots.filter(s => String(s.planId) === filterPlan);

  // Group by plan
  const grouped = {};
  filtered.forEach(s => {
    const key = s.planName || "Unknown Plan";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Slot Management</h2>
          <p className="text-sm text-ink-400 mt-0.5">Define time slots for fixed-hour plans</p>
        </div>
        {isFixed && (
          <Button onClick={openCreate}><Plus size={16} /> Add Slot</Button>
        )}
      </div>

      {!loading && !isFixed && (
        <Card className="p-5 flex gap-3 items-start border-amber-400/30 bg-amber-400/5">
          <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-ink-100 font-medium">Library is in Flexible Hour mode</p>
            <p className="text-sm text-ink-400 mt-0.5">
              Switch to Fixed Hour mode in Library Settings to enable slot management.
            </p>
          </div>
        </Card>
      )}

      {isFixed && (
        <>
          <div className="flex gap-3 items-center">
            <Select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="w-48">
              <option value="ALL">All Plans</option>
              {plans.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
            </Select>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Clock size={26} />} title="No slots defined" description="Create slots for your fixed-hour plans." actionLabel="Add Slot" onAction={openCreate} />
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([planName, planSlots]) => {
                const plan = plans.find(p => p.name === planName);
                const planHours = plan ? (plan.hoursPerDay || plan.duration || 6) : 6;
                const maxSlots = plan ? Math.floor(24 / planHours) : "?";
                return (
                  <Card key={planName}>
                    <CardHeader className="flex items-center justify-between">
                      <div>
                        <CardTitle>{planName}</CardTitle>
                        <p className="text-xs text-ink-400 mt-0.5">{planSlots.length} / {maxSlots} slots configured</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAutoGenerate(plan?.id)}
                          disabled={autoGenerating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition-colors disabled:opacity-50"
                          title="Auto-generate continuous slots starting 6 AM"
                        >
                          <Zap size={12} /> Auto-generate
                        </button>
                        <Badge tone={planSlots.length >= maxSlots ? "success" : "warning"}>
                          {planSlots.length >= maxSlots ? "Complete" : "Incomplete"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-2">
                      {planSlots
                        .sort((a, b) => a.startTime?.localeCompare(b.startTime))
                        .map((slot, idx) => (
                          <div key={slot.id} className="flex items-center justify-between rounded-xl border border-ink-700 px-4 py-3 hover:border-ink-500 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-semibold">{idx + 1}</span>
                              <div>
                                <p className="text-sm text-ink-100 font-medium">{slot.slotName}</p>
                                <p className="text-xs text-ink-400">{formatTime(slot.startTime)} — {formatTime(slot.endTime)} · {slot.durationHours}h</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => openEdit(slot)} className="p-2 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDelete(slot.id)} className="p-2 rounded-lg text-ink-400 hover:text-danger hover:bg-danger-soft transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Slot" : "Create Slot"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Save Changes" : "Create Slot"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label required>Slot Name</Label>
            <Input value={form.slotName} onChange={e => setForm({ ...form, slotName: e.target.value })} placeholder="Morning Slot" />
          </div>
          <div>
            <Label required>Plan</Label>
            <Select value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })}>
              <option value="">Select plan</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.hoursPerDay || p.duration}h study/day)</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label required>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <Label required>End Time</Label>
              <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          {form.planId && form.startTime && form.endTime && (() => {
            const plan = plans.find(p => String(p.id) === String(form.planId));
            if (!plan) return null;
            const planHours = plan.hoursPerDay || plan.duration;
            const [sh, sm] = form.startTime.split(":").map(Number);
            const [eh, em] = form.endTime.split(":").map(Number);
            const startMins = sh * 60 + sm;
            const endMins = eh * 60 + em;
            let diffMins = endMins - startMins;
            if (diffMins <= 0) diffMins += 24 * 60; // midnight cross handle
            const diffH = diffMins / 60;
            const match = Math.abs(diffH - planHours) < 0.01;
            return (
              <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${match ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                <AlertCircle size={14} />
                Slot duration: {diffH.toFixed(1)}h — Plan requires: {planHours}h/day
                {match ? " ✓" : " ✗ Duration mismatch"}
              </div>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
}
