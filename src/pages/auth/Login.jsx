import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, Lock } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const ROLE_HOME = {
  SUPERADMIN: "/superadmin",
  LIBRARY_ADMIN: "/admin",
  STUDENT: "/student",
};

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || ROLE_HOME[user.roleShort] || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout title="Log in to StudyHub" subtitle="Welcome back. Let's get you to your seat.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label required>Username</Label>
          <Input
            icon={<User size={16} />}
            placeholder="your.username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={errors.username}
            autoComplete="username"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label required className="mb-0">Password</Label>
            <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300">
              Forgot password?
            </Link>
          </div>
          <Input
            icon={<Lock size={16} />}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full mt-2" loading={loading}>
          Log in
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-ink-700 text-center text-sm text-ink-400">
        Want to bring your library on StudyHub?{" "}
        <Link to="/register-library" className="text-amber-400 hover:text-amber-300 font-medium">
          Register your library
        </Link>
      </div>
    </AuthLayout>
  );
}
