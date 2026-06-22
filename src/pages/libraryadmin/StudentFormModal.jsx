import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Input, Label, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { createStudent, updateStudent, getAllPlans } from "../../api/libraryAdminApi";
import { getAllSeats } from "../../api/seatApi";

const empty = { fullName: "", email: "", phone: "", username: "", password: "", planId: "", seatId: "" };

export default function StudentFormModal({ open, onClose, editing, onSaved }) {
  const [form, setForm] = useState(empty);
  const [plans, setPlans] = useState([]);
  const [seats, setSeats] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            fullName: editing.fullName || "",
            email: editing.email || "",
            phone: editing.phone || "",
            username: editing.username || "",
            password: "",
            planId: editing.planId || editing.plan?.id || "",
            seatId: editing.seatId || editing.seat?.id || "",
          }
        : empty
    );
    getAllPlans().then(({ data }) => setPlans(data || [])).catch(() => {});
    getAllSeats().then(({ data }) => setSeats((data || []).filter((s) => s.status === "AVAILABLE" || s.id === editing?.seatId))).catch(() => {});
  }, [open, editing]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return toast.error("Name and phone are required");
    if (!editing && (!form.username || !form.password)) return toast.error("Username and password are required for a new student");

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        username: form.username,
        password: form.password,
        planId: form.planId ? Number(form.planId) : null,
        seatId: form.seatId ? Number(form.seatId) : null,
      };
      if (editing) {
        await updateStudent(editing.id, payload);
        toast.success("Student updated");
      } else {
        await createStudent(payload);
        toast.success("Student added");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit student" : "Add a new student"}
      size="lg"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={saving}>{editing ? "Save changes" : "Add student"}</Button>
      </>}
    >
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <Label required>Full name</Label>
          <Input value={form.fullName} onChange={update("fullName")} placeholder="Aditi Patel" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={update("email")} />
        </div>
        <div>
          <Label required>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} />
        </div>
        <div>
          <Label>Plan</Label>
          <Select value={form.planId} onChange={update("planId")}>
            <option value="">No plan assigned</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
          </Select>
        </div>
        <div>
          <Label>Seat</Label>
          <Select value={form.seatId} onChange={update("seatId")}>
            <option value="">No seat assigned</option>
            {seats.map((s) => <option key={s.id} value={s.id}>{s.seatName} ({s.location})</option>)}
          </Select>
        </div>

        {!editing && (
          <>
            <div className="sm:col-span-2 pt-1 border-t border-ink-700">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mt-3 mb-1">Student login</p>
            </div>
            <div>
              <Label required>Username</Label>
              <Input value={form.username} onChange={update("username")} />
            </div>
            <div>
              <Label required>Password</Label>
              <Input type="password" value={form.password} onChange={update("password")} />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
