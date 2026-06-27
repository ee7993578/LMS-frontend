import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm]     = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This password reset link is invalid or missing.">
        <Link to="/forgot-password" className="flex items-center justify-center gap-1.5 text-sm text-amber-400 hover:text-amber-300">
          Request a new reset link
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password: form.password });
      setDone(true);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout title="Password Updated!" subtitle="Your password has been reset successfully.">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <Button className="w-full" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Make it strong and memorable.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>New password</Label>
          <Input icon={<Lock size={16} />} type="password" placeholder="Min 6 characters"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <Label required>Confirm password</Label>
          <Input icon={<Lock size={16} />} type="password" placeholder="Repeat password"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          <CheckCircle2 size={16} className="mr-1.5" /> Update password
        </Button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-200 mt-6">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </AuthLayout>
  );
}
