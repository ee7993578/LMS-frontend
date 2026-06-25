import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Textarea, Label } from "../../components/ui/Input";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { getAllPlanRequests, approvePlanRequest, rejectPlanRequest } from "../../api/superAdminApi";

const STATUS_TONE = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };
const FILTERS = ["PENDING", "APPROVED", "REJECTED", "ALL"];

export default function SuperAdminPlanRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [actionTarget, setActionTarget] = useState(null); // { request, action: "approve" | "reject" }
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = (f = filter) => {
    setLoading(true);
    getAllPlanRequests(f === "ALL" ? null : f)
      .then(({ data }) => setRequests(data || []))
      .catch(() => toast.error("Couldn't load plan requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(filter); }, [filter]);

  const openAction = (request, action) => {
    setActionTarget({ request, action });
    setResolutionNote("");
  };

  const submitAction = async () => {
    setSubmitting(true);
    try {
      if (actionTarget.action === "approve") {
        await approvePlanRequest(actionTarget.request.id, resolutionNote);
        toast.success(`Approved — ${actionTarget.request.libraryName} switched to ${actionTarget.request.requestedPlanName}`);
      } else {
        await rejectPlanRequest(actionTarget.request.id, resolutionNote);
        toast.success("Request rejected");
      }
      setActionTarget(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">Plan change requests</h2>
        <p className="text-sm text-ink-400 mt-0.5">Library admins request plan upgrades/downgrades here for your approval.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-amber-400 text-ink-950" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Table>
        <THead>
          <tr>
            <TH>Library</TH>
            <TH>Current plan</TH>
            <TH>Requested plan</TH>
            <TH>Note</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)
          ) : requests.length === 0 ? (
            <tr><td colSpan={6}>
              <EmptyState icon={<ClipboardList size={26} />} title="No requests" description={`No ${filter.toLowerCase()} plan change requests right now.`} />
            </td></tr>
          ) : (
            requests.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium text-ink-100">{r.libraryName}</TD>
                <TD>{r.currentPlanName || <span className="text-ink-500">No plan</span>}</TD>
                <TD>
                  <p className="text-ink-100">{r.requestedPlanName}</p>
                  <p className="text-xs text-ink-500">₹{r.requestedPlanPrice} · {r.requestedPlanStudents} students</p>
                </TD>
                <TD className="max-w-[220px]"><p className="text-xs text-ink-400 truncate">{r.note || "—"}</p></TD>
                <TD><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></TD>
                <TD className="text-right">
                  {r.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openAction(r, "approve")} className="h-8 w-8 rounded-lg hover:bg-success-soft flex items-center justify-center text-success" title="Approve">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => openAction(r, "reject")} className="h-8 w-8 rounded-lg hover:bg-danger-soft flex items-center justify-center text-danger" title="Reject">
                        <XCircle size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-500 flex items-center gap-1 justify-end">
                      <Clock size={12} /> {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : ""}
                    </span>
                  )}
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Modal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.action === "approve" ? "Approve plan change" : "Reject plan change"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionTarget(null)}>Cancel</Button>
            <Button variant={actionTarget?.action === "reject" ? "danger" : "primary"} onClick={submitAction} loading={submitting}>
              {actionTarget?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      >
        {actionTarget && (
          <div className="space-y-3">
            <p className="text-sm text-ink-300">
              {actionTarget.action === "approve" ? (
                <>This will switch <span className="text-ink-50 font-medium">{actionTarget.request.libraryName}</span> from{" "}
                  <span className="text-ink-50 font-medium">{actionTarget.request.currentPlanName || "no plan"}</span> to{" "}
                  <span className="text-ink-50 font-medium">{actionTarget.request.requestedPlanName}</span> immediately.</>
              ) : (
                <>This will reject the request — <span className="text-ink-50 font-medium">{actionTarget.request.libraryName}</span>'s
                  plan stays unchanged.</>
              )}
            </p>
            <div>
              <Label>Note (optional, visible to the library admin)</Label>
              <Textarea value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} placeholder="e.g. Approved — welcome to the Growth plan!" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
