import { useEffect, useState } from "react";
import { LifeBuoy, Send, RefreshCw, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { Modal } from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { getAllTickets, getTicketStats, adminGetTicket, updateStatus, adminReply } from "../../api/ticketApi";

const STATUS_TONE = { OPEN:"warning", IN_PROGRESS:"info", RESOLVED:"success", CLOSED:"danger" };
const PRIORITY_TONE = { LOW:"info", MEDIUM:"warning", HIGH:"danger" };
const STATUSES = ["OPEN","IN_PROGRESS","RESOLVED","CLOSED"];

export default function SupportTicketsAdmin() {
  const [tickets, setTickets]   = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [view, setView]         = useState(null);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([getAllTickets(), getTicketStats()])
      .then(([tR, sR]) => {
        if (tR.status==="fulfilled") setTickets(tR.value.data||[]);
        if (sR.status==="fulfilled") setStats(sR.value.data||{});
      }).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const openTicket = (id) => adminGetTicket(id).then(r=>setView(r.data)).catch(()=>toast.error("Failed"));

  const handleStatus = async (id, status) => {
    await updateStatus(id, status);
    toast.success("Status updated");
    load();
    if (view?.id===id) openTicket(id);
  };

  const handleReply = async () => {
    if (!reply.trim() || !view) return;
    setSending(true);
    try { await adminReply(view.id, reply); toast.success("Reply sent"); setReply(""); openTicket(view.id); }
    catch { toast.error("Failed"); } finally { setSending(false); }
  };

  const filtered = filter==="ALL" ? tickets : tickets.filter(t=>t.status===filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Support Tickets</h2>
          <p className="text-sm text-ink-400 mt-0.5">Manage library support requests</p>
        </div>
        <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.map(s=>(
          <StatCard key={s} label={s.replace("_"," ")} value={stats[s]||0} icon={<LifeBuoy size={16}/>}
            tone={STATUS_TONE[s]} />
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL",...STATUSES].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter===s ? "bg-amber-400 text-ink-900" : "bg-ink-800 text-ink-400 hover:text-ink-200"}`}>
            {s.replace("_"," ")}
          </button>
        ))}
      </div>

      <Card>
        <CardBody>
          <Table>
            <THead><tr><TH>#</TH><TH>Library</TH><TH>Subject</TH><TH>Priority</TH><TH>Status</TH><TH>Created</TH><TH></TH></tr></THead>
            <TBody>
              {loading
                ? Array.from({length:5}).map((_,i)=><TR key={i}>{Array.from({length:7}).map((_,j)=><TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                : filtered.length===0
                  ? <tr><td colSpan={7}><EmptyState icon={<LifeBuoy size={24}/>} title="No tickets" description="No support tickets found."/></td></tr>
                  : filtered.map(t=>(
                    <TR key={t.id}>
                      <TD className="text-ink-500 text-xs">#{t.id}</TD>
                      <TD className="text-ink-300 text-sm">{t.libraryName||"—"}</TD>
                      <TD className="font-medium text-ink-100">{t.subject}</TD>
                      <TD><Badge tone={PRIORITY_TONE[t.priority]||"info"}>{t.priority}</Badge></TD>
                      <TD><Badge tone={STATUS_TONE[t.status]}>{t.status?.replace("_"," ")}</Badge></TD>
                      <TD className="text-ink-400 text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "—"}</TD>
                      <TD><Button size="sm" variant="secondary" onClick={()=>openTicket(t.id)}><ChevronRight size={13}/> Open</Button></TD>
                    </TR>
                  ))
              }
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <Modal open={!!view} onClose={()=>setView(null)} title={`Ticket #${view?.id} — ${view?.subject}`} size="lg">
        {view && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              <Badge tone={STATUS_TONE[view.status]}>{view.status?.replace("_"," ")}</Badge>
              <Badge tone={PRIORITY_TONE[view.priority]||"info"}>{view.priority}</Badge>
              <span className="text-xs text-ink-500">from {view.libraryName}</span>
              <div className="ml-auto flex gap-1">
                {STATUSES.filter(s=>s!==view.status).map(s=>(
                  <button key={s} onClick={()=>handleStatus(view.id,s)}
                    className="px-2 py-1 text-xs bg-ink-700 hover:bg-ink-600 rounded-lg text-ink-300 transition-colors">
                    → {s.replace("_"," ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-ink-800 rounded-xl p-4 text-sm text-ink-300">{view.description}</div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(view.replies||[]).map(r=>(
                <div key={r.id} className={`rounded-xl p-3 text-sm ${r.isAdminReply?"bg-amber-400/10 border border-amber-400/20 ml-8":"bg-ink-800 mr-8"}`}>
                  <div className="flex justify-between text-xs text-ink-500 mb-1">
                    <span className={r.isAdminReply?"text-amber-400 font-medium":"text-ink-300"}>{r.repliedBy}{r.isAdminReply?" (Admin)":""}</span>
                    <span>{r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : ""}</span>
                  </div>
                  <p className="text-ink-200">{r.message}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea rows={2} className="flex-1 bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400 resize-none"
                placeholder="Reply to this ticket..." value={reply} onChange={e=>setReply(e.target.value)}/>
              <Button onClick={handleReply} loading={sending}><Send size={14}/></Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
