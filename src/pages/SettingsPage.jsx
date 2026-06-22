import { useState } from "react";
import { User, Lock, Palette, Bell, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../components/ui/Card";
import { Input, Label } from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../utils/format";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage({ extraSections }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">Settings</h2>
        <p className="text-sm text-ink-400 mt-0.5">Manage your account and preferences.</p>
      </div>

      <div className="grid lg:grid-cols-[220px,1fr] gap-5">
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-amber-400/10 text-amber-300 border border-amber-400/20" : "text-ink-300 hover:bg-ink-800"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === "profile" && (
            <Card>
              <CardHeader><CardTitle>Profile information</CardTitle></CardHeader>
              <CardBody>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-amber-400 text-ink-950 flex items-center justify-center text-xl font-semibold">
                    {initials(user?.username || "U")}
                  </div>
                  <div>
                    <p className="text-ink-50 font-medium">{user?.username}</p>
                    <p className="text-xs text-ink-400">{user?.roleShort?.replace("_", " ")}</p>
                  </div>
                </div>
                <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 max-w-xl">
                  <div>
                    <Label>Full name</Label>
                    <Input defaultValue={user?.username} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="98765 43210" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" loading={saving}>Save changes</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader><CardTitle>Password & security</CardTitle></CardHeader>
              <CardBody>
                <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="sm:col-span-2">
                    <Label>Current password</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>New password</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Confirm new password</Label>
                    <Input type="password" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" loading={saving}>Update password</Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {tab === "appearance" && (
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardBody>
                <div className="flex items-center justify-between max-w-xl rounded-xl border border-ink-700 p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-100">Theme</p>
                    <p className="text-xs text-ink-400">Switch between dark and light mode</p>
                  </div>
                  <button onClick={toggleTheme} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-ink-800 border border-ink-600 text-sm text-ink-200">
                    {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
                    {theme === "dark" ? "Dark" : "Light"}
                  </button>
                </div>
              </CardBody>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader><CardTitle>Notification preferences</CardTitle></CardHeader>
              <CardBody className="space-y-3">
                {["Email notifications", "Push notifications", "Renewal reminders", "Weekly summary"].map((label) => (
                  <label key={label} className="flex items-center justify-between rounded-xl border border-ink-700 p-3.5 cursor-pointer">
                    <span className="text-sm text-ink-200">{label}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-400" />
                  </label>
                ))}
              </CardBody>
            </Card>
          )}

          {extraSections}
        </div>
      </div>
    </div>
  );
}
