import { useState } from "react";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, Bell } from "lucide-react";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/format";

export default function StudentProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated");
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <div className="h-20 w-20 rounded-2xl bg-amber-400 text-white flex items-center justify-center text-2xl font-semibold mx-auto mb-3">
          {initials(user?.username || "S")}
        </div>
        <h2 className="font-display text-xl text-ink-50">{user?.username}</h2>
        <p className="text-sm text-ink-400">Student</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input icon={<User size={15} />} defaultValue={user?.username} />
            </div>
            <div>
              <Label>Email</Label>
              <Input icon={<Mail size={15} />} type="email" placeholder="you@email.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input icon={<Phone size={15} />} placeholder="98765 43210" />
            </div>
            <Button type="submit" loading={saving} className="w-full">Save changes</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Current password</Label>
              <Input icon={<Lock size={15} />} type="password" />
            </div>
            <div>
              <Label>New password</Label>
              <Input icon={<Lock size={15} />} type="password" />
            </div>
            <Button type="submit" variant="secondary" loading={saving} className="w-full">Update password</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <Bell size={16} className="text-ink-400" />
        </CardHeader>
        <CardBody className="space-y-3">
          {["Renewal reminders", "Streak alerts", "Fee due alerts"].map((label) => (
            <label key={label} className="flex items-center justify-between rounded-xl border border-ink-700 p-3.5">
              <span className="text-sm text-ink-200">{label}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-400" />
            </label>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
