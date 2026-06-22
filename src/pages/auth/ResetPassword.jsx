import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    setLoading(true);
    // NOTE: UI-only — wire to a real reset-password endpoint when available.
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated. Please log in.");
      navigate("/login");
    }, 700);
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Make it something you'll remember at your study desk.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>New password</Label>
          <Input icon={<Lock size={16} />} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <Label required>Confirm password</Label>
          <Input icon={<Lock size={16} />} type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          <CheckCircle2 size={16} className="mr-1.5" /> Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
