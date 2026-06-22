import { useEffect, useState } from "react";
import { Plus, Layers, Pencil, Trash2, Users, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Input, Label } from "../../components/ui/Input";
import { EmptyState, SkeletonCard } from "../../components/ui/Feedback";
import {
  getAllLibraryPlans, createLibraryPlan, updateLibraryPlan, deleteLibraryPlan,
} from "../../api/superAdminApi";

const empty = { planName: "", planPrice: "", noOfStudent: "", bufferStudent: "", planOrder: "", noOfDays: 30 };

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchPlans = () => {
    setLoading(true);
    getAllLibraryPlans().then(({ data }) => setPlans(data || [])).catch(() => toast.error("Couldn't load plans", { id: "load-plans-super" })).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const openForm = (plan) => {
    setEditing(plan);
    setForm(plan ? { ...plan } : empty);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planName || !form.planPrice || !form.noOfStudent) return toast.error("Plan name, price, and student limit are required");
    setSaving(true);
    try {
      const payload = {
        planName: form.planName,
        planPrice: Number(form.planPrice),
        noOfStudent: Number(form.noOfStudent),
        bufferStudent: Number(form.bufferStudent || 0),
        planOrder: Number(form.planOrder || 0),
        noOfDays: Number(form.noOfDays || 30),
      };
      if (editing) {
        await updateLibraryPlan(editing.planId, payload);
        toast.success("Plan updated");
      } else {
        await createLibraryPlan(payload);
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
      await deleteLibraryPlan(confirmDelete.planId);
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
          <h2 className="font-display text-xl text-ink-50">Subscription plans</h2>
          <p className="text-sm text-ink-400 mt-0.5">Platform-level plans assigned to libraries.</p>
        </div>
        <Button onClick={() => openForm(null)}><Plus size={16} /> New plan</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <Card><EmptyState icon={<Layers size={26} />} title="No plans yet" description="Create your first subscription tier for libraries to choose from." actionLabel="New plan" onAction={() => openForm(null)} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.sort((a, b) => (a.planOrder || 0) - (b.planOrder || 0)).map((plan) => (
            <Card key={plan.planId} className="p-5" hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-ink-50">{plan.planName}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openForm(plan)} className="h-8 w-8 rounded-lg hover:bg-ink-700 flex items-center justify-center text-ink-400"><Pencil size={14} /></button>
                  <button onClick={() => setConfirmDelete(plan)} className="h-8 w-8 rounded-lg hover:bg-danger-soft flex items-center justify-center text-ink-400 hover:text-danger"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="font-display text-3xl text-ink-50">₹{plan.planPrice?.toLocaleString("en-IN")}<span className="text-sm text-ink-400 font-sans">/mo</span></p>
              <div className="flex items-center gap-4 mt-4 text-sm text-ink-400">
                <span className="flex items-center gap-1.5"><Users size={14} /> {plan.noOfStudent} students</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {plan.noOfDays}d cycle</span>
              </div>
              {plan.bufferStudent > 0 && (
                <p className="text-xs text-ink-500 mt-2">+{plan.bufferStudent} buffer slots allowed</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit plan" : "New subscription plan"}
        footer={<>
          <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editing ? "Save changes" : "Create plan"}</Button>
        </>}
      >
        <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <Label required>Plan name</Label>
            <Input value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} placeholder="Growth" />
          </div>
          <div>
            <Label required>Price per month (₹)</Label>
            <Input type="number" value={form.planPrice} onChange={(e) => setForm({ ...form, planPrice: e.target.value })} />
          </div>
          <div>
            <Label required>Student limit</Label>
            <Input type="number" value={form.noOfStudent} onChange={(e) => setForm({ ...form, noOfStudent: e.target.value })} />
          </div>
          <div>
            <Label>Buffer students</Label>
            <Input type="number" value={form.bufferStudent} onChange={(e) => setForm({ ...form, bufferStudent: e.target.value })} />
          </div>
          <div>
            <Label>Billing cycle (days)</Label>
            <Input type="number" value={form.noOfDays} onChange={(e) => setForm({ ...form, noOfDays: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Display order</Label>
            <Input type="number" value={form.planOrder} onChange={(e) => setForm({ ...form, planOrder: e.target.value })} />
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
        <p className="text-sm text-ink-300">
          Delete <span className="text-ink-50 font-medium">{confirmDelete?.planName}</span>? Libraries currently
          on this plan will keep their existing limits until reassigned.
        </p>
      </Modal>
    </div>
  );
}
