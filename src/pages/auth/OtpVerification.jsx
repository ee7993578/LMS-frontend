import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your registered email";
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(45);
  const refs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.some((d) => d === "")) return toast.error("Enter the full 6-digit code");
    setLoading(true);
    // NOTE: UI-only flow — connect to a real verify-otp endpoint when available.
    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password", { state: { email } });
    }, 600);
  };

  return (
    <AuthLayout title="Verify your code" subtitle={`We sent a 6-digit code to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2.5 justify-between">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-display rounded-xl bg-ink-800 border border-ink-600 text-ink-50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
            />
          ))}
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Verify code
        </Button>

        <p className="text-center text-sm text-ink-400">
          {timer > 0 ? (
            <>Resend code in <span className="text-ink-200 font-medium">{timer}s</span></>
          ) : (
            <button type="button" onClick={() => setTimer(45)} className="text-amber-400 hover:text-amber-300 font-medium">
              Resend code
            </button>
          )}
        </p>
      </form>

      <Link to="/forgot-password" className="flex items-center justify-center gap-1.5 text-sm text-ink-400 hover:text-ink-200 mt-6">
        <ArrowLeft size={14} /> Back
      </Link>
    </AuthLayout>
  );
}
