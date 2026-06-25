import { useEffect, useState } from "react";
import {
  Plus, Search, MoreVertical, Building2, Pencil, Trash2, Ban, CheckCircle2,
  RotateCcw, RefreshCw, ArrowUpCircle, ArrowDownCircle, Gauge,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal, Drawer } from "../../components/ui/Modal";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import LibraryFormModal from "./LibraryFormModal";
import {
  getAllLibraries, deleteLibrary,
  activateLibrary, suspendLibrary, restoreLibrary, renewLibrarySubscription,
  upgradeLibraryPlan, downgradeLibraryPlan, getLibraryUsage, getAllLibraryPlans,
} from "../../api/superAdminApi";

const STATUS_LABEL = {
  TRIAL: "Trial",
  TRIAL_READ_ONLY: "Trial expired (read-only)",
  ACTIVE: "Active",
  EXPIRED_READ_ONLY: "Subscription expired (read-only)",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
  PENDING: "Pending",
};

export default function Libraries() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [usageLib, setUsageLib] = useState(null);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [planPicker, setPlanPicker] = useState(null); // { lib, mode: "upgrade" | "downgrade" }
  const [plans, setPlans] = useState([]);

  const fetchLibraries = () => {
    setLoading(true);
    getAllLibraries()
      .then(({ data }) => setLibraries(data || []))
      .catch(() => toast.error("Couldn't load libraries", { id: "load-libraries" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLibraries(); }, []);

  const filtered = libraries.filter((l) =>
    [l.name, l.email, l.phone].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async () => {
    try {
      await deleteLibrary(confirmDelete.id);
      toast.success("Library marked as deleted");
      setConfirmDelete(null);
      fetchLibraries();
    } catch {
      toast.error("Failed to delete library");
    }
  };

  const runAction = async (actionFn, lib, successMsg) => {
    try {
      await actionFn(lib.id);
      toast.success(successMsg);
      setOpenMenuId(null);
      fetchLibraries();
    } catch (err) {
      toast.error(err.response?.data || "Action failed");
    }
  };

  const openUsage = async (lib) => {
    setOpenMenuId(null);
    setUsageLib(lib);
    setUsage(null);
    setUsageLoading(true);
    try {
      const { data } = await getLibraryUsage(lib.id);
      setUsage(data);
    } catch {
      toast.error("Couldn't load usage details");
    } finally {
      setUsageLoading(false);
    }
  };

  const openPlanPicker = async (lib, mode) => {
    setOpenMenuId(null);
    setPlanPicker({ lib, mode });
    try {
      const { data } = await getAllLibraryPlans();
      setPlans((data || []).filter((p) => p.planId !== lib.libraryPlan?.planId));
    } catch {
      toast.error("Couldn't load plans");
    }
  };

  const handlePlanPick = async (planId) => {
    const { lib, mode } = planPicker;
    try {
      if (mode === "upgrade") await upgradeLibraryPlan(lib.id, planId);
      else await downgradeLibraryPlan(lib.id, planId);
      toast.success(`Plan ${mode === "upgrade" ? "upgraded" : "downgraded"} for ${lib.name}`);
      setPlanPicker(null);
      fetchLibraries();
    } catch (err) {
      toast.error(err.response?.data || "Failed to change plan");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Libraries</h2>
          <p className="text-sm text-ink-400 mt-0.5">{libraries.length} libraries registered on the platform</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Add library
        </Button>
      </div>

      <div className="max-w-sm">
        <Input icon={<Search size={16} />} placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table>
        <THead>
          <tr>
            <TH>Library</TH>
            <TH>Contact</TH>
            <TH>Status</TH>
            <TH>Plan</TH>
            <TH>Students</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)
          ) : filtered.length === 0 ? (
            <tr><td colSpan={6}>
              <EmptyState
                icon={<Building2 size={26} />}
                title="No libraries found"
                description={search ? "Try a different search term." : "Get started by adding your first library."}
                actionLabel={!search ? "Add library" : undefined}
                onAction={() => setFormOpen(true)}
              />
            </td></tr>
          ) : (
            filtered.map((lib) => (
              <TR key={lib.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ink-800 flex items-center justify-center text-amber-400 shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="text-ink-100 font-medium">{lib.name}</p>
                      <p className="text-xs text-ink-500">{lib.address}</p>
                    </div>
                  </div>
                </TD>
                <TD>
                  <p>{lib.email}</p>
                  <p className="text-xs text-ink-500">{lib.phone}</p>
                </TD>
                <TD>
                  <Badge tone={STATUS_TONE[lib.status] || "neutral"}>{STATUS_LABEL[lib.status] || lib.status}</Badge>
                  {lib.daysRemainingInCurrentPhase != null && (
                    <p className="text-[11px] text-ink-500 mt-1">{lib.daysRemainingInCurrentPhase}d left in phase</p>
                  )}
                </TD>
                <TD>{lib.libraryPlan?.planName || <span className="text-ink-500">No plan</span>}</TD>
                <TD>{lib.currentStudentCount ?? "—"}</TD>
                <TD className="text-right relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === lib.id ? null : lib.id)}
                    className="h-8 w-8 rounded-lg hover:bg-ink-700 inline-flex items-center justify-center text-ink-400"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {openMenuId === lib.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-4 mt-1 w-56 bg-ink-800 border border-ink-600 rounded-xl shadow-[var(--shadow-soft-lg)] z-20 py-1.5 text-left">
                        <button onClick={() => { setEditing(lib); setFormOpen(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <Pencil size={14} /> Edit details
                        </button>
                        <button onClick={() => openUsage(lib)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <Gauge size={14} /> View usage
                        </button>
                        <div className="my-1 border-t border-ink-700" />
                        {lib.status !== "ACTIVE" && (
                          <button onClick={() => runAction(activateLibrary, lib, `${lib.name} activated`)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-success hover:bg-success-soft">
                            <CheckCircle2 size={14} /> Activate
                          </button>
                        )}
                        {lib.status !== "INACTIVE" && lib.status !== "DELETED" && (
                          <button onClick={() => runAction(suspendLibrary, lib, `${lib.name} suspended`)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-warning-soft">
                            <Ban size={14} /> Suspend
                          </button>
                        )}
                        {(lib.status === "INACTIVE" || lib.status === "DELETED") && (
                          <button onClick={() => runAction(restoreLibrary, lib, `${lib.name} restored`)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-info hover:bg-info-soft">
                            <RotateCcw size={14} /> Restore
                          </button>
                        )}
                        <button onClick={() => runAction((id) => renewLibrarySubscription(id), lib, `${lib.name}'s subscription renewed`)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <RefreshCw size={14} /> Renew subscription
                        </button>
                        <button onClick={() => openPlanPicker(lib, "upgrade")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <ArrowUpCircle size={14} /> Upgrade plan
                        </button>
                        <button onClick={() => openPlanPicker(lib, "downgrade")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <ArrowDownCircle size={14} /> Downgrade plan
                        </button>
                        <div className="my-1 border-t border-ink-700" />
                        <button onClick={() => { setConfirmDelete(lib); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <LibraryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        onSaved={() => { setFormOpen(false); fetchLibraries(); }}
      />

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete library"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-ink-300">
          This marks <span className="text-ink-50 font-medium">{confirmDelete?.name}</span> as deleted —
          login is blocked and it disappears from active lists. No student, fee, or seat data is removed,
          and the library can be restored later from the actions menu.
        </p>
      </Modal>

      {/* Plan upgrade/downgrade picker */}
      <Modal
        open={!!planPicker}
        onClose={() => setPlanPicker(null)}
        title={planPicker?.mode === "upgrade" ? "Upgrade plan" : "Downgrade plan"}
      >
        <div className="space-y-2">
          {plans.length === 0 && <p className="text-sm text-ink-400">No other plans available.</p>}
          {plans.map((p) => (
            <button
              key={p.planId}
              onClick={() => handlePlanPick(p.planId)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-ink-600 hover:border-amber-400/50 hover:bg-ink-800 text-left transition-colors"
            >
              <div>
                <p className="text-ink-100 font-medium">{p.planName}</p>
                <p className="text-xs text-ink-500">{p.noOfStudent} students + {p.bufferStudent} grace · {p.noOfDays} days</p>
              </div>
              <span className="text-amber-300 font-medium">₹{p.planPrice}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Usage drawer */}
      <Drawer open={!!usageLib} onClose={() => setUsageLib(null)} title={usageLib ? `${usageLib.name} — usage` : "Usage"}>
        {usageLoading ? (
          <p className="text-sm text-ink-400">Loading...</p>
        ) : usage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Current students</p>
                <p className="text-xl text-ink-50 font-display">{usage.currentStudentCount}</p>
              </div>
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Plan limit</p>
                <p className="text-xl text-ink-50 font-display">{usage.planLimit ?? "—"}</p>
              </div>
            </div>
            {usage.graceLimit != null && (
              <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
                <p className="text-xs text-ink-500">Grace usage</p>
                <p className="text-ink-100">
                  {Math.max(0, usage.currentStudentCount - (usage.planLimit ?? 0))}/{usage.graceLimit - (usage.planLimit ?? 0)} grace seats used
                </p>
              </div>
            )}
            {usage.inGracePeriod && (
              <div className="rounded-xl bg-warning-soft border border-warning/30 p-3">
                <p className="text-sm text-warning font-medium">
                  {usage.graceExceeded
                    ? "Grace period exceeded — new student registration is blocked until the plan is upgraded."
                    : `You are currently using grace students. Upgrade the plan within ${usage.graceDaysRemaining ?? "a few"} day(s).`}
                </p>
              </div>
            )}
            <div className="rounded-xl bg-ink-800 border border-ink-700 p-3">
              <p className="text-xs text-ink-500">Lifecycle status</p>
              <Badge tone={STATUS_TONE[usage.status] || "neutral"}>{STATUS_LABEL[usage.status] || usage.status}</Badge>
              {usage.daysRemainingInCurrentPhase != null && (
                <p className="text-xs text-ink-500 mt-1">{usage.daysRemainingInCurrentPhase} day(s) remaining in this phase</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-400">No usage data.</p>
        )}
      </Drawer>
    </div>
  );
}
