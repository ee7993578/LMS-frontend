import { useEffect, useState } from "react";
import { Building2, Clock, Save, CheckCircle2, QrCode, Hand, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getMyLibrary, updateLibrarySettings } from "../../api/librarySettingsApi";
import clsx from "clsx";

export default function LibraryAdminSettings() {
  const [library, setLibrary] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", email: "", phone: "", website: "" });
  const [allocationMode, setAllocationMode] = useState("FLEXIBLE_HOUR");
  const [attendanceMode, setAttendanceMode] = useState("BOTH");
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [savingAttMode, setSavingAttMode] = useState(false);

  useEffect(() => {
    getMyLibrary().then(({ data }) => {
      setLibrary(data);
      setForm({
        name: data.name || "",
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        website: data.website || "",
      });
      setAllocationMode(data.allocationMode || "FLEXIBLE_HOUR");
      setAttendanceMode(data.attendanceMode || "BOTH");
    }).catch(() => toast.error("Failed to load library settings"));
  }, []);

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await updateLibrarySettings({ ...form, allocationMode, attendanceMode });
      toast.success("Library details saved");
    } catch {
      toast.error("Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMode = async (mode) => {
    setSavingMode(true);
    try {
      await updateLibrarySettings({ allocationMode: mode, attendanceMode });
      setAllocationMode(mode);
      toast.success(`Switched to ${mode === "FIXED_HOUR" ? "Fixed Hour" : "Flexible Hour"} mode`);
    } catch {
      toast.error("Failed to update allocation mode");
    } finally {
      setSavingMode(false);
    }
  };

  const handleSaveAttMode = async (mode) => {
    setSavingAttMode(true);
    try {
      await updateLibrarySettings({ allocationMode, attendanceMode: mode });
      setAttendanceMode(mode);
      const labels = { QR_CODE: "QR Code only", NORMAL: "Normal (Punch) only", BOTH: "Both (QR + Punch)" };
      toast.success(`Attendance mode: ${labels[mode]}`);
    } catch {
      toast.error("Failed to update attendance mode");
    } finally {
      setSavingAttMode(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-50">Library Settings</h2>
        <p className="text-sm text-ink-400 mt-0.5">Manage your library details and configuration</p>
      </div>

      {/* Library Info */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Building2 size={16} className="text-amber-400" />
          <CardTitle>Library Details</CardTitle>
        </CardHeader>
        <CardBody className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Library Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Horizon Study Center" />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="library@email.com" />
          </div>
          <div>
            <Label>Contact Phone</Label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Library address" />
          </div>
          <div className="sm:col-span-2">
            <Label>Website</Label>
            <Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourlibrary.com" />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleSaveInfo} loading={saving}><Save size={14} /> Save Details</Button>
          </div>
        </CardBody>
      </Card>

      {/* Attendance Mode */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <QrCode size={16} className="text-amber-400" />
          <CardTitle>Attendance Mode</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-400">
            Choose how students mark attendance. This controls what options appear on the student's punch page.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                key: "NORMAL",
                title: "Normal",
                desc: "Students punch in/out manually. QR code option hidden.",
                icon: <Hand size={18} className="text-info" />,
                badge: "Manual only",
                tone: "info",
              },
              {
                key: "QR_CODE",
                title: "QR Code",
                desc: "Students scan QR code only. Manual punch hidden.",
                icon: <QrCode size={18} className="text-amber-400" />,
                badge: "QR only",
                tone: "amber",
              },
              {
                key: "BOTH",
                title: "Both",
                desc: "Students can use both manual punch and QR scan.",
                icon: <Layers size={18} className="text-teal-400" />,
                badge: "QR + Manual",
                tone: "teal",
              },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => handleSaveAttMode(opt.key)}
                disabled={savingAttMode}
                className={clsx(
                  "text-left rounded-2xl border-2 p-4 transition-all",
                  attendanceMode === opt.key
                    ? "border-amber-400 bg-amber-400/5"
                    : "border-ink-700 hover:border-ink-500"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  {opt.icon}
                  {attendanceMode === opt.key && <CheckCircle2 size={16} className="text-amber-400" />}
                </div>
                <p className="font-medium text-ink-100 text-sm mb-1">{opt.title}</p>
                <p className="text-xs text-ink-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className={clsx(
            "rounded-xl p-3.5 text-sm border",
            attendanceMode === "QR_CODE" ? "bg-amber-400/5 border-amber-400/30 text-amber-300"
            : attendanceMode === "NORMAL" ? "bg-info-soft border-info/30 text-info"
            : "bg-teal-500/5 border-teal-500/30 text-teal-400"
          )}>
            Currently active: <span className="font-semibold">
              {attendanceMode === "QR_CODE" ? "QR Code only"
                : attendanceMode === "NORMAL" ? "Normal (Manual Punch) only"
                : "Both — QR Code + Manual Punch"}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Allocation Mode */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <CardTitle>Seat Allocation Mode</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-400">Choose how students are assigned to seats.</p>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                key: "FIXED_HOUR",
                title: "Fixed Hour",
                desc: "Students assigned to specific time slots (e.g. 6AM–12PM). Predefined slots per plan.",
                badge: "Slot-based",
                tone: "amber",
              },
              {
                key: "FLEXIBLE_HOUR",
                title: "Flexible Hour",
                desc: "Students choose their own start and end time within plan duration.",
                badge: "Time range",
                tone: "info",
              },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => handleSaveMode(opt.key)}
                disabled={savingMode}
                className={clsx(
                  "text-left rounded-2xl border-2 p-4 transition-all",
                  allocationMode === opt.key
                    ? "border-amber-400 bg-amber-400/5"
                    : "border-ink-700 hover:border-ink-500"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-ink-100">{opt.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge tone={opt.tone}>{opt.badge}</Badge>
                    {allocationMode === opt.key && <CheckCircle2 size={16} className="text-amber-400" />}
                  </div>
                </div>
                <p className="text-xs text-ink-400 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className={clsx("rounded-xl p-3.5 text-sm border", allocationMode === "FIXED_HOUR" ? "bg-amber-400/5 border-amber-400/30 text-amber-300" : "bg-info-soft border-info/30 text-info")}>
            Currently active: <span className="font-semibold">{allocationMode === "FIXED_HOUR" ? "Fixed Hour mode" : "Flexible Hour mode"}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
