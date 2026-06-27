import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your registered email");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast.success("If that email is registered, a reset link has been sent.");
    } catch {
      // Show same message to not reveal if email exists
      setSent(true);
      toast.success("If that email is registered, a reset link has been sent.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a password reset link to your email.">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <Mail size={28} className="text-green-400" />
          </div>
          <p className="text-sm text-ink-400">
            Click the link in the email to reset your password. The link expires in 30 minutes.
          </p>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 mt-4">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>Email address</Label>
          <Input icon={<Mail size={16} />} type="email" placeholder="you@library.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-200 mt-6">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </AuthLayout>
  );
}
