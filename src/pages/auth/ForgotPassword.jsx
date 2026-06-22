import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Enter your registered email or username");
    setLoading(true);
    // NOTE: no backend endpoint exists for this yet — wire to a real
    // /api/auth/forgot-password call once it's added on the server.
    setTimeout(() => {
      setLoading(false);
      toast.success("If that account exists, an OTP has been sent.");
      navigate("/otp-verification", { state: { email } });
    }, 700);
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="We'll send a one-time code to verify it's you.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>Email or username</Label>
          <Input icon={<Mail size={16} />} placeholder="you@library.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Send reset code
        </Button>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-200 mt-6">
        <ArrowLeft size={14} /> Back to login
      </Link>
    </AuthLayout>
  );
}
