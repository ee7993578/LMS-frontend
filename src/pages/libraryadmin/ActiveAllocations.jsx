import { useEffect, useState } from "react";
import { Armchair, UserX, History } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { getActiveAllocations, getAllocationHistory, deallocateByAllocationId } from "../../api/seatApi";
import { formatDateTime } from "../../utils/format";

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default function ActiveAllocations() {
  const [tab, setTab] = useState("active");
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, h] = await Promise.all([getActiveAllocations(), getAllocationHistory()]);
      setActive(a.data || []);
      setHistory(h.data || []);
    } catch {
      toast.error("Failed to load allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDeallocate = async (id) => {
    try {
      await deallocateByAllocationId(id);
      toast.success("Seat deallocated");
      load();
    } catch (err) {
      toast.error(err.response?.data || "Failed to deallocate");
    }
  };

  const rows = tab === "active" ? active : history;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">Allocations</h2>
        <p className="text-sm text-ink-400 mt-0.5">Manage active and historical seat allocations</p>
      </div>

      <div className="flex gap-1.5 border-b border-ink-700 pb-px">
        {[
          { key: "active", label: `Active (${active.length})`, icon: Armchair },
          { key: "history", label: `History (${history.length})`, icon: History },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-amber-400 text-amber-300" : "border-transparent text-ink-400 hover:text-ink-200"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <Card>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}</div>
            ) : rows.length === 0 ? (
              <EmptyState icon={<Armchair size={26} />} title={tab === "active" ? "No active allocations" : "No history yet"} description="Allocations will appear here once created." />
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Student</TH>
                    <TH>Seat</TH>
                    <TH>Plan</TH>
                    <TH>Time / Slot</TH>
                    <TH>Mode</TH>
                    <TH>Allocated</TH>
                    {tab === "active" && <TH>Action</TH>}
                  </tr>
                </THead>
                <TBody>
                  {rows.map(a => (
                    <TR key={a.id}>
                      <TD className="font-medium text-ink-100">{a.studentName}</TD>
                      <TD>{a.seatName} <span className="text-ink-500 text-xs">· {a.seatLocation}</span></TD>
                      <TD>{a.planName}</TD>
                      <TD className="text-ink-300 text-xs">
                        {a.allocationMode === "FIXED_HOUR"
                          ? <><span className="font-medium">{a.slotName}</span><br />{formatTime(a.slotStart)} — {formatTime(a.slotEnd)}</>
                          : <>{formatTime(a.flexStartTime)} — {formatTime(a.flexEndTime)}</>}
                      </TD>
                      <TD><Badge tone={a.allocationMode === "FIXED_HOUR" ? "amber" : "info"}>{a.allocationMode === "FIXED_HOUR" ? "Fixed" : "Flexible"}</Badge></TD>
                      <TD className="text-ink-400 text-xs">{formatDateTime(a.allocatedAt)}</TD>
                      {tab === "active" && (
                        <TD>
                          <Button variant="danger" size="sm" onClick={() => handleDeallocate(a.id)}>
                            <UserX size={13} /> Free
                          </Button>
                        </TD>
                      )}
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-2">
              <div className="h-4 rounded bg-ink-700 animate-pulse w-32" />
              <div className="h-3 rounded bg-ink-700 animate-pulse w-48" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <EmptyState icon={<Armchair size={26} />} title={tab === "active" ? "No active allocations" : "No history yet"} description="Allocations will appear here once created." />
        ) : (
          rows.map(a => (
            <div key={a.id} className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-100 text-sm">{a.studentName}</p>
                <Badge tone={a.allocationMode === "FIXED_HOUR" ? "amber" : "info"}>
                  {a.allocationMode === "FIXED_HOUR" ? "Fixed" : "Flex"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Seat</p>
                  <p className="text-ink-200">{a.seatName}</p>
                  <p className="text-xs text-ink-500">{a.seatLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Plan</p>
                  <p className="text-ink-200">{a.planName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Time</p>
                  <p className="text-ink-200 text-xs">
                    {a.allocationMode === "FIXED_HOUR"
                      ? `${a.slotName}: ${formatTime(a.slotStart)} – ${formatTime(a.slotEnd)}`
                      : `${formatTime(a.flexStartTime)} – ${formatTime(a.flexEndTime)}`}
                  </p>
                </div>
              </div>
              {tab === "active" && (
                <Button variant="danger" size="sm" className="w-full" onClick={() => handleDeallocate(a.id)}>
                  <UserX size={13} /> Free Seat
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
