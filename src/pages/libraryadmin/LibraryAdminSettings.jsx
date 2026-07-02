import { useEffect, useState } from "react";
import { Building2, Clock, Save, CheckCircle2, QrCode, Hand, Layers, CreditCard, AlertTriangle, ArrowUpCircle, History, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { getMyLibrary, updateLibrarySettings } from "../../api/librarySettingsApi";
import {
  getMySubscriptionStatus, getPlanCatalog, getMyPlanRequests,
  initiatePlanUpgrade, verifyPlanUpgrade, cancelPlanUpgrade,
} from "../../api/libraryAdminApi";
import { openRazorpayCheckout } from "../../utils/razorpay";
import clsx from "clsx";
import { useOnboarding } from "../../context/OnboardingContext";
import OnboardingSuccessModal from "../../components/onboarding/OnboardingSuccessModal";
import PageHelpNote from "../../components/onboarding/PageHelpNote";

const STATUS_LABEL = {
  TRIAL: "Free trial",
  TRIAL_READ_ONLY: "Trial expired (read-only)",
  ACTIVE: "Active",
  EXPIRED_READ_ONLY: "Subscription expired (read-only)",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
  PENDING: "Pending",
};

const REQUEST_STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

export default function LibraryAdminSettings() {
  const [library, setLibrary] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", email: "", phone: "", website: "" });
  const [allocationMode, setAllocationMode] = useState("FLEXIBLE_HOUR");
  const [attendanceMode, setAttendanceMode] = useState("BOTH");
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [savingAttMode, setSavingAttMode] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const { checkStepJustCompleted } = useOnboarding();
  const [successData, setSuccessData] = useState(null);

  const [planCatalog, setPlanCatalog] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [requestNote, setRequestNote] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const pendingRequest = myRequests.find((r) => r.status === "PENDING");
  const selectedPlanPrice = planCatalog.find((p) => p.planId === selectedPlanId)?.planPrice ?? 0;

  const refreshRequests = () => {
    getMyPlanRequests().then(({ data }) => setMyRequests(data || [])).catch(() => {});
  };

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
      setRegistrationEnabled(data.registrationEnabled !== false);
    }).catch(() => toast.error("Failed to load library settings"));

    getMySubscriptionStatus().then(({ data }) => setSubscription(data)).catch(() => {});
    refreshRequests();
  }, []);

  const openUpgradeModal = () => {
    setSelectedPlanId(null);
    setRequestNote("");
    getPlanCatalog().then(({ data }) => setPlanCatalog(data || [])).catch(() => toast.error("Couldn't load plans"));
    setUpgradeModalOpen(true);
  };

  const submitPlanRequest = async () => {
    if (!selectedPlanId) return toast.error("Pick a plan first");
    setSubmittingRequest(true);
    try {
      const { data: order } = await initiatePlanUpgrade(selectedPlanId, requestNote);

      if (!order.requiresPayment) {
        // Free plan switch — goes to SuperAdmin for approval, same as before.
        toast.success("Plan change request sent to SuperAdmin for approval");
        setUpgradeModalOpen(false);
        refreshRequests();
        return;
      }

      // Paid plan — open Razorpay Checkout. On success, verify immediately applies the
      // upgrade (no SuperAdmin wait). On cancel/failure, release the pending request.
      try {
        const result = await openRazorpayCheckout(order, {
          name: library?.adminFullName,
          email: library?.email,
          contact: library?.adminPhone || library?.phone,
        });
        await verifyPlanUpgrade({
          paymentRecordId: order.paymentRecordId,
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        });
        toast.success("Payment received! Your plan has been upgraded.");
        setUpgradeModalOpen(false);
        refreshRequests();
        getMySubscriptionStatus().then(({ data }) => setSubscription(data)).catch(() => {});
      } catch (checkoutErr) {
        cancelPlanUpgrade(order.paymentRecordId).catch(() => {});
        if (checkoutErr?.cancelled) {
          toast.error("Payment was cancelled. You can request the upgrade again anytime.");
        } else {
          toast.error("Payment verification failed. Please try again.");
        }
        refreshRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Failed to submit request");
    } finally {
      setSubmittingRequest(false);
    }
  };

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

  const handleToggleRegistration = async (next) => {
    setSavingRegistration(true);
    try {
      await updateLibrarySettings({ allocationMode, attendanceMode, registrationEnabled: next });
      setRegistrationEnabled(next);
      toast.success(next ? "Self registration enabled" : "Self registration disabled");
      if (next) {
        const fresh = await checkStepJustCompleted("SELF_REGISTRATION");
        if (fresh) {
          setSuccessData({
            justCompletedLabel: "Self Registration",
            next: fresh.recommendedNextStep,
            allCompleted: fresh.allCompleted,
          });
        }
      }
    } catch {
      toast.error("Failed to update self registration");
    } finally {
      setSavingRegistration(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-50">Library Settings</h2>
        <p className="text-sm text-ink-400 mt-0.5">Manage your library details and configuration</p>
      </div>

      <PageHelpNote>
        Configure your library profile, self registration, attendance mode and seat allocation mode here. Changes apply immediately.
      </PageHelpNote>

      {/* Subscription & Plan */}
      {subscription && (
        <Card>
          <CardHeader className="flex items-center gap-2">
            <CreditCard size={16} className="text-amber-400" />
            <CardTitle>Subscription &amp; plan</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm text-ink-400">Current status</p>
                <div className="mt-1">
                  <Badge tone={STATUS_TONE[subscription.status] || "neutral"}>
                    {STATUS_LABEL[subscription.status] || subscription.status}
                  </Badge>
                </div>
              </div>
              {subscription.daysRemainingInCurrentPhase != null && (
                <div className="text-right">
                  <p className="text-sm text-ink-400">Days remaining</p>
                  <p className="font-display text-xl text-ink-50">{subscription.daysRemainingInCurrentPhase}</p>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Plan</p>
                <p className="text-ink-100 font-medium mt-0.5">{subscription.planName || "No plan assigned"}</p>
              </div>
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Current students</p>
                <p className="text-ink-100 font-medium mt-0.5">{subscription.currentStudentCount}</p>
              </div>
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Plan limit</p>
                <p className="text-ink-100 font-medium mt-0.5">{subscription.planLimit ?? "—"}</p>
              </div>
            </div>

            {subscription.graceLimit != null && subscription.planLimit != null && (
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Grace usage</p>
                <p className="text-ink-100">
                  {Math.max(0, subscription.currentStudentCount - subscription.planLimit)}/{subscription.graceLimit - subscription.planLimit} grace seats used
                </p>
              </div>
            )}

            {subscription.inGracePeriod && (
              <div className="flex items-start gap-2 rounded-xl bg-warning-soft border border-warning/30 p-3">
                <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  {subscription.graceExceeded
                    ? "You have exceeded your plan limit. Upgrade your subscription within 3 days."
                    : "You are currently using grace students. Upgrade your plan before grace period ends."}
                  {subscription.graceDaysRemaining != null && !subscription.graceExceeded && (
                    <> ({subscription.graceDaysRemaining} day(s) left)</>
                  )}
                </p>
              </div>
            )}

            {pendingRequest && (
              <div className="flex items-start gap-2 rounded-xl bg-info-soft border border-info/30 p-3">
                <Clock size={16} className="text-info shrink-0 mt-0.5" />
                <p className="text-sm text-info">
                  Your request to switch to <span className="font-medium">{pendingRequest.requestedPlanName}</span> is
                  pending SuperAdmin approval.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button onClick={openUpgradeModal} disabled={!!pendingRequest}>
                <ArrowUpCircle size={14} /> {pendingRequest ? "Request pending" : "Upgrade / change plan"}
              </Button>
              <Button variant="secondary" onClick={() => setHistoryOpen(true)}>
                <History size={14} /> Request history
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

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

      {/* Self Registration */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Layers size={16} className="text-amber-400" />
          <CardTitle>Self Registration</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-400">
            Allow students to register themselves using your registration page and automatically join your library.
            You can enable or disable this anytime.
          </p>
          <div className="flex items-center justify-between rounded-xl border border-ink-700 p-4">
            <div>
              <p className="text-sm font-medium text-ink-100">
                {registrationEnabled ? "Self registration is ON" : "Self registration is OFF"}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {registrationEnabled
                  ? "Students can join via your registration link / QR code."
                  : "Only admin-added students can join right now."}
              </p>
            </div>
            <button
              onClick={() => handleToggleRegistration(!registrationEnabled)}
              disabled={savingRegistration}
              className={clsx(
                "relative h-7 w-12 rounded-full transition-colors shrink-0",
                registrationEnabled ? "bg-amber-400" : "bg-ink-700"
              )}
            >
              <span
                className={clsx(
                  "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                  registrationEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
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

      {/* Upgrade / change plan modal */}
      <Modal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade or change plan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)}>Cancel</Button>
            <Button onClick={submitPlanRequest} loading={submittingRequest} disabled={!selectedPlanId}>
              {selectedPlanPrice > 0 ? "Pay & upgrade" : "Send request"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-400">
            Pick the plan you'd like to switch to. Paid plans open secure payment (Razorpay) —
            your plan upgrades the instant payment succeeds. Free plans are sent to SuperAdmin for approval.
          </p>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {planCatalog.length === 0 && <p className="text-sm text-ink-500">Loading plans...</p>}
            {planCatalog.map((p) => (
              <button
                key={p.planId}
                onClick={() => setSelectedPlanId(p.planId)}
                disabled={subscription?.planName === p.planName}
                className={clsx(
                  "w-full text-left rounded-xl border-2 p-3.5 transition-all",
                  selectedPlanId === p.planId ? "border-amber-400 bg-amber-400/5" : "border-ink-700 hover:border-ink-500",
                  subscription?.planName === p.planName && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink-100">
                    {p.planName} {subscription?.planName === p.planName && <span className="text-xs text-ink-500">(current plan)</span>}
                  </p>
                  <span className="text-amber-300 font-medium">{p.planPrice > 0 ? `₹${p.planPrice}` : "Free"}</span>
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  {p.noOfStudent} students + {p.bufferStudent ?? 0} grace · {p.noOfDays} day cycle
                </p>
                {p.description && <p className="text-xs text-ink-400 mt-1">{p.description}</p>}
              </button>
            ))}
          </div>
          <div>
            <Label>Note for SuperAdmin (optional)</Label>
            <Textarea value={requestNote} onChange={(e) => setRequestNote(e.target.value)} placeholder="e.g. We're growing fast and need more seats" />
          </div>
        </div>
      </Modal>

      {/* Request history modal */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Plan change request history">
        {myRequests.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-6">No plan change requests yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {myRequests.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink-700 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-100 font-medium">
                    {r.currentPlanName || "No plan"} → {r.requestedPlanName}
                  </p>
                  <Badge tone={REQUEST_STATUS_TONE[r.status] || "neutral"}>{r.status}</Badge>
                </div>
                {r.note && <p className="text-xs text-ink-500 mt-1">Note: {r.note}</p>}
                {r.resolutionNote && (
                  <p className="text-xs text-ink-400 mt-1 flex items-center gap-1">
                    {r.status === "REJECTED" ? <XCircle size={12} className="text-danger" /> : <CheckCircle2 size={12} className="text-success" />}
                    SuperAdmin: {r.resolutionNote}
                  </p>
                )}
                <p className="text-[11px] text-ink-600 mt-1">
                  Requested {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <OnboardingSuccessModal data={successData} onClose={() => setSuccessData(null)} />
    </div>
  );
}
