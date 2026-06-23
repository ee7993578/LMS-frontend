import { useEffect, useState } from "react";
import { Plus, Layers, Pencil, Trash2, CalendarDays, Clock, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Input, Label } from "../../components/ui/Input";
import { EmptyState, SkeletonCard } from "../../components/ui/Feedback";
import { getAllPlans, createPlan, updatePlan, deletePlan } from "../../api/libraryAdminApi";
import { formatCurrency } from "../../utils/format";

const empty = { name: "", subscriptionDays: "", hoursPerDay: "", price: "" };

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
    getAllPlans()
      .then(({ data }) => setPlans(data || []))
      .catch(() => toast.error("Couldn't load plans", { id: "load-plans" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openForm = (plan) => {
    setEditing(plan);
    setForm(plan
      ? { name: plan.name, subscriptionDays: plan.subscriptionDays ?? plan.duration ?? "", hoursPerDay: plan.hoursPerDay ?? "", price: plan.price ?? "" }
      : empty);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Plan name required");
    if (!form.subscriptionDays) return toast.error("Subscription days required");
    if (!form.hoursPerDay) return toast.error("No. of hours required");
    if (!form.price) return toast.error("Price required");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        subscriptionDays: Number(form.subscriptionDays),
        hoursPerDay: Number(form.hoursPerDay),
        duration: Number(form.subscriptionDays), // keep backward compat
        price: Number(form.price),
      };
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

  const f = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Plans</h2>
          <p className="text-sm text-ink-400 mt-0.5">Student subscription plans for your library</p>
        </div>
        <Button onClick={() => openForm(null)}><Plus size={16} /> New plan</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <EmptyState icon={<Layers size={26} />} title="No plans yet" description="Create plans students can subscribe to." actionLabel="New plan" onAction={() => openForm(null)} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-5" hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-ink-50">{plan.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openForm(plan)} className="h-8 w-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-400"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(plan)} className="h-8 w-8 rounded-lg hover:bg-danger-soft flex items-center justify-center text-ink-400 hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <IndianRupee size={15} className="text-amber-400" />
                  <span><span className="font-semibold text-ink-50">{formatCurrency(plan.price)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <CalendarDays size={15} className="text-amber-400" />
                  <span><span className="font-semibold text-ink-50">{plan.subscriptionDays ?? plan.duration ?? "—"}</span> days subscription</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-300">
                  <Clock size={15} className="text-teal-400" />
                  <span><span className="font-semibold text-ink-50">{plan.hoursPerDay ?? "—"}</span> hours / day</span>
                </div>
              </div>
            </Card>
          ))}
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
        <div className="space-y-4">
          <div>
            <Label required>Plan Name</Label>
            <Input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="e.g. Monthly — Reading Hall" />
          </div>
          <div>
            <Label required>Subscription Days</Label>
            <Input type="number" min="1" value={form.subscriptionDays} onChange={(e) => f("subscriptionDays", e.target.value)} placeholder="30" />
            <p className="text-xs text-ink-500 mt-1">Kitne din ka subscription hoga</p>
          </div>
          <div>
            <Label required>No. of Hours (per day)</Label>
            <Input type="number" min="1" max="24" value={form.hoursPerDay} onChange={(e) => f("hoursPerDay", e.target.value)} placeholder="8" />
            <p className="text-xs text-ink-500 mt-1">Ek din mein kitne ghante study — slot create karte waqt use hoga</p>
          </div>
          <div>
            <Label required>Price (₹)</Label>
            <Input type="number" min="0" icon={<IndianRupee size={15} />} value={form.price} onChange={(e) => f("price", e.target.value)} placeholder="1500" />
            <p className="text-xs text-ink-500 mt-1">Is plan ki total price</p>
          </div>
        </div>
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
