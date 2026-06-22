import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Enter the 6-digit authenticator code");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Verified");
      navigate("/login");
    }, 600);
  };

  return (
    <AuthLayout title="Two-factor verification" subtitle="Enter the code from your authenticator app.">
      <div className="flex items-center gap-3 rounded-xl bg-ink-800 border border-ink-600 p-3.5 mb-5">
        <div className="h-9 w-9 rounded-lg bg-info-soft text-info flex items-center justify-center">
          <Smartphone size={16} />
        </div>
        <p className="text-xs text-ink-300">
          This extra step keeps your library's data secure even if your password is compromised.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="000000"
          className="w-full h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl bg-ink-800 border border-ink-600 text-ink-50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
        />
        <Button type="submit" className="w-full" loading={loading}>
          <ShieldCheck size={16} className="mr-1.5" /> Verify & continue
        </Button>
      </form>
    </AuthLayout>
  );
}
