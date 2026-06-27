import { useEffect, useState } from "react";
import {
  UserPlus, CheckCircle2, XCircle, Eye, Clock, RefreshCw,
  User, Phone, Mail, Users, MapPin, FileText, Camera,
  ChevronRight, AlertCircle, Armchair, Layers
} from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import StatCard from "../../components/ui/StatCard";
import {
  getPendingRegistrations, approveStudent, rejectStudent,
  getRegistrationSettings, updateRegistrationSettings
} from "../../api/registrationApi";
import { getAllSeats } from "../../api/seatApi";
import { getAllPlans } from "../../api/libraryAdminApi";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function PendingRegistrations() {
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [settings, setSettings]   = useState(null);
  const [seats, setSeats]         = useState([]);
  const [plans, setPlans]         = useState([]);

  // View modal
  const [viewStudent, setViewStudent] = useState(null);

  // Approve modal
  const [approving, setApproving]   = useState(null); // student being approved
  const [approveForm, setApproveForm] = useState({ seatId: "", planId: "", admissionNumber: "" });
  const [approveLoading, setApproveLoading] = useState(false);

  // Reject modal
  const [rejecting, setRejecting]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getPendingRegistrations(),
      getRegistrationSettings(),
      getAllSeats(),
      getAllPlans(),
    ]).then(([pR, sR, seR, plR]) => {
      if (pR.status === "fulfilled") setStudents(pR.value.data || []);
      if (sR.status === "fulfilled") {
        setSettings(sR.value.data);
        setSettingsForm(sR.value.data);
      }
      if (seR.status === "fulfilled") setSeats((seR.value.data || []).filter(s => s.status === "AVAILABLE"));
      if (plR.status === "fulfilled") setPlans(plR.value.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async () => {
    if (!approving) return;
    setApproveLoading(true);
    try {
      const res = await approveStudent(approving.id, {
        seatId: approveForm.seatId || null,
        planId: approveForm.planId || null,
        admissionNumber: approveForm.admissionNumber || null,
      });
      toast.success(`✅ ${approving.fullName} approved!`);
      // Show credentials
      if (res.data?.username) {
        toast.success(`Login: ${res.data.username} / ${res.data.tempPassword}`, { duration: 8000 });
      }
      setApproving(null);
      setApproveForm({ seatId: "", planId: "", admissionNumber: "" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Approve failed");
    } finally { setApproveLoading(false); }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setRejectLoading(true);
    try {
      await rejectStudent(rejecting.id, rejectReason);
      toast.success("Registration rejected");
      setRejecting(null);
      setRejectReason("");
      load();
    } catch { toast.error("Reject failed"); } finally { setRejectLoading(false); }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await updateRegistrationSettings(settingsForm);
      setSettings(res.data);
      toast.success("Settings saved!");
      setShowSettings(false);
    } catch { toast.error("Save failed"); } finally { setSettingsSaving(false); }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/register/${settings?.libraryCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Registration link copied!");
  };

  const imgUrl = (url) => url ? `${BACKEND}/${url}` : null;

  const pendingCount  = students.filter(s => s.registrationStatus === "PENDING_APPROVAL").length;
  const approvedCount = students.filter(s => s.registrationStatus === "APPROVED").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Student Registrations</h2>
          <p className="text-sm text-ink-400 mt-0.5">Review and manage self-registered students</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
          <Button size="sm" variant="secondary" onClick={() => setShowSettings(true)}>⚙️ Settings & Link</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Pending Review"   value={pendingCount}  icon={<Clock size={16}/>}       tone="warning"/>
        <StatCard label="Total Registered" value={students.length} icon={<UserPlus size={16}/>}  tone="info"/>
        {settings && (
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-4">
            <p className="text-xs text-ink-500 mb-1">Registration Link</p>
            <p className="text-xs font-mono text-amber-300 truncate">{settings.libraryCode}</p>
            <button onClick={copyLink} className="text-xs text-ink-500 hover:text-amber-400 mt-1 transition-colors">
              Copy Link →
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock size={14} className="text-amber-400"/> Pending Approval ({pendingCount})
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Table>
            <THead>
              <tr>
                <TH>Photo</TH><TH>Name</TH><TH>Phone</TH><TH>Email</TH>
                <TH>Father</TH><TH>Submitted</TH><TH>Status</TH><TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {loading
                ? Array.from({length:4}).map((_,i) => <TR key={i}>{Array.from({length:8}).map((_,j) => <TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                : students.length === 0
                  ? <tr><td colSpan={8}><EmptyState icon={<UserPlus size={24}/>} title="No pending registrations" description="Share your registration link with students."/></td></tr>
                  : students.map(s => (
                    <TR key={s.id}>
                      <TD>
                        {s.photoUrl
                          ? <img src={imgUrl(s.photoUrl)} alt="photo" className="w-9 h-9 rounded-xl object-cover"/>
                          : <div className="w-9 h-9 rounded-xl bg-ink-700 flex items-center justify-center text-ink-500"><User size={14}/></div>}
                      </TD>
                      <TD className="font-medium text-ink-100">{s.fullName}</TD>
                      <TD className="text-ink-400">{s.phone || "—"}</TD>
                      <TD className="text-ink-400 text-xs">{s.email || "—"}</TD>
                      <TD className="text-ink-400 text-xs">{s.fatherName || "—"}</TD>
                      <TD className="text-ink-500 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "—"}</TD>
                      <TD>
                        <Badge tone={
                          s.registrationStatus === "APPROVED" ? "success" :
                          s.registrationStatus === "REJECTED" ? "danger" : "warning"
                        }>{s.registrationStatus?.replace("_"," ")}</Badge>
                      </TD>
                      <TD className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="secondary" onClick={() => setViewStudent(s)} title="View Details">
                            <Eye size={13}/>
                          </Button>
                          {s.registrationStatus === "PENDING_APPROVAL" && (<>
                            <Button size="sm" onClick={() => { setApproving(s); setApproveForm({ seatId:"", planId:"", admissionNumber:"" }); }} title="Approve">
                              <CheckCircle2 size={13}/>
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => { setRejecting(s); setRejectReason(""); }} title="Reject">
                              <XCircle size={13}/>
                            </Button>
                          </>)}
                        </div>
                      </TD>
                    </TR>
                  ))
              }
            </TBody>
          </Table>
        </CardBody>
      </Card>

      {/* ── VIEW MODAL ─────────────────────────────────────────────────────── */}
      <Modal open={!!viewStudent} onClose={() => setViewStudent(null)}
        title={`Registration — ${viewStudent?.fullName}`} size="md">
        {viewStudent && (
          <div className="space-y-4">
            {/* Photo + status */}
            <div className="flex gap-4 items-start">
              {viewStudent.photoUrl
                ? <img src={imgUrl(viewStudent.photoUrl)} alt="photo"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-ink-600"/>
                : <div className="w-20 h-20 rounded-2xl bg-ink-800 flex items-center justify-center"><User size={28} className="text-ink-500"/></div>}
              <div className="flex-1">
                <p className="font-semibold text-ink-100 text-lg">{viewStudent.fullName}</p>
                <Badge tone={viewStudent.registrationStatus === "APPROVED" ? "success" : viewStudent.registrationStatus === "REJECTED" ? "danger" : "warning"}>
                  {viewStudent.registrationStatus?.replace("_"," ")}
                </Badge>
                <p className="text-xs text-ink-500 mt-1">Registered: {viewStudent.createdAt ? new Date(viewStudent.createdAt).toLocaleString("en-IN") : "—"}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Phone size={13}/>, label:"Phone", value: viewStudent.phone },
                { icon: <Mail size={13}/>,  label:"Email", value: viewStudent.email },
                { icon: <Users size={13}/>, label:"Father", value: viewStudent.fatherName },
                { icon: <MapPin size={13}/>,label:"Address", value: viewStudent.address },
              ].map(item => (
                <div key={item.label} className="bg-ink-800 rounded-xl p-3">
                  <p className="text-xs text-ink-500 flex items-center gap-1 mb-1">{item.icon} {item.label}</p>
                  <p className="text-sm text-ink-200">{item.value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Aadhar photo */}
            {viewStudent.aadharPhotoUrl && (
              <div>
                <p className="text-xs text-ink-500 mb-2 flex items-center gap-1"><FileText size={12}/> Aadhar Photo</p>
                <img src={imgUrl(viewStudent.aadharPhotoUrl)} alt="aadhar"
                  className="w-full max-h-48 object-contain rounded-xl border border-ink-700"/>
              </div>
            )}

            {viewStudent.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                <p className="text-sm text-red-300">{viewStudent.rejectionReason}</p>
              </div>
            )}

            {viewStudent.registrationStatus === "PENDING_APPROVAL" && (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { setViewStudent(null); setApproving(viewStudent); }}>
                  <CheckCircle2 size={14}/> Approve
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => { setViewStudent(null); setRejecting(viewStudent); }}>
                  <XCircle size={14}/> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── APPROVE MODAL ──────────────────────────────────────────────────── */}
      <Modal open={!!approving} onClose={() => setApproving(null)}
        title={`Approve — ${approving?.fullName}`} size="md">
        {approving && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-green-300">
              <CheckCircle2 size={16}/> You are approving this student's registration
            </div>

            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3">
              <p className="text-xs text-amber-400 font-semibold mb-1">⚠️ Seat & Plan are optional</p>
              <p className="text-xs text-ink-400">You can assign seat/plan now or later from the Students section. Student will be activated immediately on approval.</p>
            </div>

            {/* Seat selection */}
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
                <Armchair size={13}/> Assign Seat <span className="text-ink-600">(Optional)</span>
              </label>
              <select className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
                value={approveForm.seatId} onChange={e => setApproveForm(p => ({...p, seatId: e.target.value}))}>
                <option value="">— Assign seat later —</option>
                {seats.map(s => <option key={s.id} value={s.id}>Seat {s.seatName} {s.location ? `(${s.location})` : ""}</option>)}
              </select>
              {seats.length === 0 && <p className="text-xs text-amber-400 mt-1">⚠️ No available seats. You can assign later.</p>}
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
                <Layers size={13}/> Assign Plan <span className="text-ink-600">(Optional)</span>
              </label>
              <select className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
                value={approveForm.planId} onChange={e => setApproveForm(p => ({...p, planId: e.target.value}))}>
                <option value="">— Assign plan later —</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} {p.price ? `(₹${p.price}/mo)` : ""}</option>)}
              </select>
            </div>

            {/* Admission number */}
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-2">
                Admission Number <span className="text-ink-600">(Auto-generated if left blank)</span>
              </label>
              <input className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
                placeholder="e.g. ADM-2026-001"
                value={approveForm.admissionNumber} onChange={e => setApproveForm(p => ({...p, admissionNumber: e.target.value}))}/>
            </div>

            <div className="bg-ink-800/50 rounded-xl p-3 text-xs text-ink-400">
              <p>After approval:</p>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Student account will be activated</li>
                <li>Temporary login credentials will be generated</li>
                <li>Student will receive a notification</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setApproving(null)}>Cancel</Button>
              <Button className="flex-1" onClick={handleApprove} loading={approveLoading}>
                <CheckCircle2 size={14}/> Approve & Activate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── REJECT MODAL ───────────────────────────────────────────────────── */}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)}
        title={`Reject — ${rejecting?.fullName}`} size="sm">
        {rejecting && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
              The student will be notified that their registration was not approved.
            </div>
            <div>
              <label className="block text-xs text-ink-400 mb-2">Reason <span className="text-ink-600">(Optional)</span></label>
              <textarea rows={3} className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-amber-400 resize-none"
                placeholder="e.g. Incomplete information, library full..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}/>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setRejecting(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={handleReject} loading={rejectLoading}>
                <XCircle size={14}/> Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── SETTINGS MODAL ─────────────────────────────────────────────────── */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)}
        title="Registration Settings" size="md">
        {settings && (
          <div className="space-y-5">
            {/* Library code + link */}
            <div className="bg-ink-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-ink-400">Your Registration Code</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-mono font-bold text-amber-300 tracking-widest">{settings.libraryCode}</p>
                <Button size="sm" variant="secondary" onClick={copyLink}>Copy Link</Button>
              </div>
              <p className="text-xs text-ink-500 font-mono break-all">
                {window.location.origin}/register/{settings.libraryCode}
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { key: "registrationEnabled", label: "Allow Self-Registration", desc: "Students can register using your library code" },
                { key: "requireAdminApproval", label: "Require Admin Approval", desc: "If off, students are auto-approved instantly" },
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between bg-ink-800 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium text-ink-100">{toggle.label}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{toggle.desc}</p>
                  </div>
                  <button onClick={() => setSettingsForm(p => ({...p, [toggle.key]: !p[toggle.key]}))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${settingsForm[toggle.key] ? "bg-amber-400" : "bg-ink-600"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settingsForm[toggle.key] ? "translate-x-6" : "translate-x-1"}`}/>
                  </button>
                </div>
              ))}
            </div>

            {/* Regenerate code */}
            <div className="flex items-center justify-between bg-ink-800 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-ink-100">Regenerate Code</p>
                <p className="text-xs text-ink-500 mt-0.5">Old code will stop working</p>
              </div>
              <button onClick={() => setSettingsForm(p => ({...p, regenerateCode: !p.regenerateCode}))}
                className={`relative w-11 h-6 rounded-full transition-colors ${settingsForm.regenerateCode ? "bg-red-500" : "bg-ink-600"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settingsForm.regenerateCode ? "translate-x-6" : "translate-x-1"}`}/>
              </button>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveSettings} loading={settingsSaving}>Save Settings</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
