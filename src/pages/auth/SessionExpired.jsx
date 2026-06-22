import { useNavigate } from "react-router-dom";
import { TimerOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function SessionExpired() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Your session has ended" subtitle="For your security, we signed you out after a period of inactivity.">
      <div className="flex flex-col items-center text-center py-4">
        <div className="h-14 w-14 rounded-2xl bg-warning-soft text-warning flex items-center justify-center mb-5">
          <TimerOff size={26} />
        </div>
        <Button onClick={() => navigate("/login")} className="w-full">
          Log in again
        </Button>
      </div>
    </AuthLayout>
  );
}
