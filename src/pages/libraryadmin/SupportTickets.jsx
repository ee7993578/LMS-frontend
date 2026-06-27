import { useEffect, useState } from "react";
import { LifeBuoy, Plus, Send, Clock, CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { createTicket, getMyTickets, getTicket, addReply } from "../../api/ticketApi";

const STATUS_TONE = { OPEN:"warning", IN_PROGRESS:"info", RESOLVED:"success", CLOSED:"danger" };
const PRIORITY_TONE = { LOW:"info", MEDIUM:"warning", HIGH:"danger" };

export default function SupportTickets() {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState(null); // selected ticket with replies
  const [viewLoad, setViewLoad]   = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]           = useState({ subject:"", description:"", priority:"MEDIUM" });
  const [creating, setCreating]   = useState(false);
  const [reply, setReply]         = useState("");
  const [sending, setSending]     = useState(false);

  const load = () => { setLoading(true); getMyTickets().then(r => setTickets(r.data||[])).catch(()=>toast.error("Load failed")).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const openTicket = (id) => {
    setViewLoad(true);
    getTicket(id).then(r=>setView(r.data)).catch(()=>toast.error("Load failed")).finally(()=>setViewLoad(false));
  };

  const handleCreate = async () => {
    if (!form.subject || !form.description) return toast.error("Subject and description required");
    setCreating(true);
    try {
      await createTicket(form);
      toast.success("Ticket created");
      setShowCreate(false); setForm({ subject:"", description:"", priority:"MEDIUM" });
      load();
    } catch { toast.error("Failed to create ticket"); } finally { setCreating(false); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !view) return;
    setSending(true);
    try {
      await addReply(view.id, reply);
      toast.success("Reply sent");
      setReply("");
      openTicket(view.id);
    } catch { toast.error("Failed to send reply"); } finally { setSending(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink-50">Support Tickets</h2>
          <p className="text-sm text-ink-400 mt-0.5">Raise issues or questions to Super Admin</p>
        </div>
        <Button onClick={()=>setShowCreate(true)}><Plus size={14}/> New Ticket</Button>
      </div>

      <Card>
        <CardBody>
          <Table>
            <THead><tr><TH>#</TH><TH>Subject</TH><TH>Priority</TH><TH>Status</TH><TH>Created</TH><TH></TH></tr></THead>
            <TBody>
              {loading
                ? Array.from({length:4}).map((_,i)=><TR key={i}>{Array.from({length:6}).map((_,j)=><TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                : tickets.length===0
                  ? <tr><td colSpan={6}><EmptyState icon={<LifeBuoy size={24}/>} title="No tickets" description="Raise a support ticket for any issues."/></td></tr>
                  : tickets.map(t=>(
                    <TR key={t.id}>
                      <TD className="text-ink-500 text-xs">#{t.id}</TD>
                      <TD className="font-medium text-ink-100">{t.subject}</TD>
                      <TD><Badge tone={PRIORITY_TONE[t.priority]||"info"}>{t.priority}</Badge></TD>
                      <TD><Badge tone={STATUS_TONE[t.status]}>{t.status?.replace("_"," ")}</Badge></TD>
                      <TD className="text-ink-400 text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "—"}</TD>
                      <TD><Button size="sm" variant="secondary" onClick={()=>openTicket(t.id)} loading={viewLoad}><ChevronRight size={13}/> View</Button></TD>
                    </TR>
                  ))
              }
            </TBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create Support Ticket" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-ink-400 mb-1">Subject *</label>
            <input className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
              placeholder="Brief subject" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}/>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">Priority</label>
            <select className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
              value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">Description *</label>
            <textarea rows={4} className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400 resize-none"
              placeholder="Describe your issue in detail..." value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={()=>setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Submit Ticket</Button>
          </div>
        </div>
      </Modal>

      {/* View Ticket Modal */}
      <Modal open={!!view} onClose={()=>setView(null)} title={`Ticket #${view?.id} — ${view?.subject}`} size="lg">
        {view && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge tone={STATUS_TONE[view.status]}>{view.status?.replace("_"," ")}</Badge>
              <Badge tone={PRIORITY_TONE[view.priority]||"info"}>{view.priority}</Badge>
            </div>
            <div className="bg-ink-800 rounded-xl p-4 text-sm text-ink-300">{view.description}</div>
            {/* Replies */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(view.replies||[]).map(r=>(
                <div key={r.id} className={`rounded-xl p-3 text-sm ${r.isAdminReply ? "bg-amber-400/10 border border-amber-400/20 ml-8" : "bg-ink-800 mr-8"}`}>
                  <div className="flex justify-between text-xs text-ink-500 mb-1">
                    <span className={r.isAdminReply ? "text-amber-400 font-medium" : "text-ink-300"}>{r.repliedBy} {r.isAdminReply ? "(Super Admin)" : ""}</span>
                    <span>{r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : ""}</span>
                  </div>
                  <p className="text-ink-200">{r.message}</p>
                </div>
              ))}
            </div>
            {view.status !== "CLOSED" && view.status !== "RESOLVED" && (
              <div className="flex gap-2">
                <textarea rows={2} className="flex-1 bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400 resize-none"
                  placeholder="Add a reply..." value={reply} onChange={e=>setReply(e.target.value)}/>
                <Button onClick={handleReply} loading={sending}><Send size={14}/></Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
