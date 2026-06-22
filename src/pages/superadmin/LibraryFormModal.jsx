import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Input, Label, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { createLibrary, updateLibrary, getAllLibraryPlans } from "../../api/superAdminApi";

const empty = {
  name: "", address: "", email: "", phone: "", website: "",
  adminUsername: "", adminPassword: "", adminFullName: "", adminPhone: "",
  libraryPlanId: "", status: "PENDING",
};

export default function LibraryFormModal({ open, onClose, editing, onSaved }) {
  const [form, setForm] = useState(empty);
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...empty, ...editing, libraryPlanId: editing.libraryPlan?.planId || "" } : empty);
      getAllLibraryPlans().then(({ data }) => setPlans(data || [])).catch(() => {});
    }
  }, [open, editing]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error("Name, email, and phone are required");
    if (!editing && (!form.adminUsername || !form.adminPassword)) {
      return toast.error("Admin username and password are required for a new library");
    }
    setSaving(true);
    try {
      const payload = { ...form, libraryPlanId: form.libraryPlanId ? Number(form.libraryPlanId) : null };
      if (editing) {
        await updateLibrary(editing.id, payload);
        toast.success("Library updated");
      } else {
        await createLibrary(payload);
        toast.success("Library created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data || "Failed to save library");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit library" : "Add a new library"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{editing ? "Save changes" : "Create library"}</Button>
        </>
      }
    >
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <Label required>Library name</Label>
          <Input value={form.name} onChange={update("name")} placeholder="Horizon Study Center" />
        </div>
        <div className="sm:col-span-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={update("address")} placeholder="Civil Lines, Meerut" />
        </div>
        <div>
          <Label required>Email</Label>
          <Input type="email" value={form.email} onChange={update("email")} />
        </div>
        <div>
          <Label required>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} />
        </div>
        <div>
          <Label>Website</Label>
          <Input value={form.website} onChange={update("website")} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={update("status")}>
            {["ACTIVE", "PENDING", "GRACE", "INACTIVE", "EXPIRED", "EXCEEDED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Subscription plan</Label>
          <Select value={form.libraryPlanId} onChange={update("libraryPlanId")}>
            <option value="">No plan assigned</option>
            {plans.map((p) => (
              <option key={p.planId} value={p.planId}>{p.planName} — ₹{p.planPrice}/mo</option>
            ))}
          </Select>
        </div>

        {!editing && (
          <>
            <div className="sm:col-span-2 pt-2 border-t border-ink-700">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mt-3 mb-1">Admin login for this library</p>
            </div>
            <div>
              <Label required>Admin full name</Label>
              <Input value={form.adminFullName} onChange={update("adminFullName")} />
            </div>
            <div>
              <Label>Admin phone</Label>
              <Input value={form.adminPhone} onChange={update("adminPhone")} />
            </div>
            <div>
              <Label required>Admin username</Label>
              <Input value={form.adminUsername} onChange={update("adminUsername")} />
            </div>
            <div>
              <Label required>Admin password</Label>
              <Input type="password" value={form.adminPassword} onChange={update("adminPassword")} />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
