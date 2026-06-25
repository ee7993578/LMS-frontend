import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, Globe, MapPin, User, Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { registerLibrary, getPublicPlans } from "../../api/publicApi";

const initialForm = {
  name: "",
  address: "",
  email: "",
  phone: "",
  website: "",
  adminFullName: "",
  adminUsername: "",
  adminPassword: "",
  adminPhone: "",
  libraryPlanId: "",
};

export default function RegisterLibrary() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getPublicPlans()
      .then(({ data }) => setPlans(data || []))
      .catch(() => setPlans([]));
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Library name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.adminUsername.trim()) e.adminUsername = "Pick a username for yourself";
    if (!form.adminPassword || form.adminPassword.length < 6)
      e.adminPassword = "Password must be at least 6 characters";
    if (!form.adminFullName.trim()) e.adminFullName = "Your name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        // Status is intentionally omitted — every new library is automatically started
        // on a 7-day free TRIAL by the backend regardless of what's sent here.
        libraryPlanId: form.libraryPlanId ? Number(form.libraryPlanId) : null,
      };
      await registerLibrary(payload);
      setDone(true);
      toast.success("Library registered! Your 7-day free trial has started — log in to get started.");
    } catch (err) {
      toast.error(err.response?.data || err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="You're all set" subtitle="Your library has been registered.">
        <div className="flex flex-col items-center text-center py-4">
          <div className="h-14 w-14 rounded-2xl bg-success-soft text-success flex items-center justify-center mb-4">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-sm text-ink-300 mb-6 leading-relaxed">
            Your library <span className="text-ink-50 font-medium">{form.name}</span> is registered and your
            7-day free trial has started. Log in with the admin username you chose to start setting up
            seats, plans, and students.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register your library"
      subtitle="Set up your study space on StudyHub in a couple of minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1 -mr-1">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide pt-1">Library details</p>

        <div>
          <Label required>Library name</Label>
          <Input icon={<Building2 size={16} />} placeholder="Horizon Study Center" value={form.name} onChange={update("name")} error={errors.name} />
        </div>

        <div>
          <Label>Address</Label>
          <Input icon={<MapPin size={16} />} placeholder="Civil Lines, Meerut" value={form.address} onChange={update("address")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Email</Label>
            <Input icon={<Mail size={16} />} type="email" placeholder="library@email.com" value={form.email} onChange={update("email")} error={errors.email} />
          </div>
          <div>
            <Label required>Phone</Label>
            <Input icon={<Phone size={16} />} placeholder="98765 43210" value={form.phone} onChange={update("phone")} error={errors.phone} />
          </div>
        </div>

        <div>
          <Label>Website (optional)</Label>
          <Input icon={<Globe size={16} />} placeholder="https://yourlibrary.com" value={form.website} onChange={update("website")} />
        </div>

        {plans.length > 0 && (
          <div>
            <Label>Subscription plan</Label>
            <Select value={form.libraryPlanId} onChange={update("libraryPlanId")}>
              <option value="">Choose a plan</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.planName} — ₹{p.planPrice}/mo · up to {p.noOfStudent} students
                </option>
              ))}
            </Select>
          </div>
        )}

        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide pt-3">Your admin login</p>

        <div>
          <Label required>Your full name</Label>
          <Input icon={<User size={16} />} placeholder="Ramesh Kumar" value={form.adminFullName} onChange={update("adminFullName")} error={errors.adminFullName} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Admin username</Label>
            <Input placeholder="ramesh_admin" value={form.adminUsername} onChange={update("adminUsername")} error={errors.adminUsername} />
          </div>
          <div>
            <Label required>Password</Label>
            <Input icon={<Lock size={16} />} type="password" placeholder="••••••••" value={form.adminPassword} onChange={update("adminPassword")} error={errors.adminPassword} />
          </div>
        </div>

        <div>
          <Label>Your phone</Label>
          <Input icon={<Phone size={16} />} placeholder="98765 43210" value={form.adminPhone} onChange={update("adminPhone")} />
        </div>

        <Button type="submit" className="w-full mt-2" loading={submitting}>
          Register library
        </Button>
      </form>

      <div className="mt-5 pt-5 border-t border-ink-700 text-center text-sm text-ink-400">
        Already on StudyHub?{" "}
        <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
