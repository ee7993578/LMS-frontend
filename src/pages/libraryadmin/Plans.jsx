import { useEffect, useState } from "react";
import { Plus, Layers, Pencil, Trash2, Clock, Check } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Input, Label } from "../../components/ui/Input";
import { EmptyState, SkeletonCard } from "../../components/ui/Feedback";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "../../api/libraryAdminApi";

const empty = { name: "", duration: "", price: "" };

const TIER_CLASSES = {
  info: "bg-info-soft text-info",
  amber: "bg-amber-500/10 text-amber-300",
  teal: "bg-teal-500/10 text-teal-400",
};

function planTier(duration) {
  if (duration <= 1) return { label: "Hourly", tone: "info" };
  if (duration <= 31) return { label: "Monthly", tone: "amber" };
  return { label: "Custom", tone: "teal" };
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPlans = () => {
    setLoading(true);
    getAllPlans().then(({ data }) => setPlans(data || [])).catch(() => toast.error("Couldn't load plans", { id: "load-plans" })).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openForm = (plan) => {
    setEditing(plan);
    setForm(plan ? { name: plan.name, duration: plan.duration, price: plan.price } : empty);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Plan name and price are required");
    setSaving(true);
    try {
      const payload = { name: form.name, duration: Number(form.duration || 0), price: Number(form.price) };
      if (editing) {
        await updatePlan(editing.id, payload);
        toast.success("Plan updated");
      } else {
        await createPlan(payload);
        toast.success("Plan created");
      }
      setFormOpen(false);
      fetchPlans();
    } catch {
      toast.error("Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlan(confirmDelete.id);
      toast.success("Plan deleted");
      setConfirmDelete(null);
      fetchPlans();
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Plans</h2>
          <p className="text-sm text-ink-400 mt-0.5">Hourly, monthly, and custom plans for your students</p>
        </div>
        <Button onClick={() => openForm(null)}><Plus size={16} /> New plan</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : plans.length === 0 ? (
        <Card><EmptyState icon={<Layers size={26} />} title="No plans yet" description="Create hourly, monthly, or custom plans students can subscribe to." actionLabel="New plan" onAction={() => openForm(null)} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const tier = planTier(plan.duration);
            return (
              <Card key={plan.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${TIER_CLASSES[tier.tone]}`}>
                    {tier.label}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openForm(plan)} className="h-8 w-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-400"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(plan)} className="h-8 w-8 rounded-lg hover:bg-danger-soft flex items-center justify-center text-ink-400 hover:text-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-display text-lg text-ink-50 mb-1">{plan.name}</h3>
                <p className="font-display text-3xl text-ink-50">₹{plan.price?.toLocaleString("en-IN")}</p>
                <p className="flex items-center gap-1.5 text-sm text-ink-400 mt-2">
                  <Clock size={14} /> {plan.duration} day{plan.duration !== 1 ? "s" : ""}
                </p>
                <div className="mt-4 pt-4 border-t border-ink-700 flex items-center gap-1.5 text-xs text-ink-400">
                  <Check size={13} className="text-success" /> Seat allocation included
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit plan" : "New plan"}
        footer={<>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editing ? "Save changes" : "Create plan"}</Button>
        </>}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label required>Plan name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Monthly — Reading Hall" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Duration (days)</Label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete plan"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>}
      >
        <p className="text-sm text-ink-300">Delete <span className="text-ink-50 font-medium">{confirmDelete?.name}</span>? Students currently on this plan will keep it until reassigned.</p>
      </Modal>
    </div>
  );
}
