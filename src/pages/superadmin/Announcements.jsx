import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Power, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Feedback";
import { getAllAnnouncements, createAnnouncement, deactivateAnnouncement, deleteAnnouncement } from "../../api/announcementApi";

const TYPE_TONE = { SYSTEM_UPDATE:"info", MAINTENANCE:"warning", OFFER:"success", SUBSCRIPTION_ALERT:"danger", GENERAL:"info" };
const TYPES = ["SYSTEM_UPDATE","MAINTENANCE","OFFER","SUBSCRIPTION_ALERT","GENERAL"];

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:"", content:"", type:"GENERAL", expiresAt:"" });
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); getAllAnnouncements().then(r=>setItems(r.data||[])).catch(()=>toast.error("Load failed")).finally(()=>setLoading(false)); };
  useEffect(()=>{ load(); },[]);

  const handleCreate = async () => {
    if (!form.title || !form.content) return toast.error("Title and content required");
    setSaving(true);
    try {
      await createAnnouncement({ ...form, expiresAt: form.expiresAt || null });
      toast.success("Announcement created");
      setShowCreate(false); setForm({ title:"", content:"", type:"GENERAL", expiresAt:"" });
      load();
    } catch { toast.error("Failed"); } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    await deactivateAnnouncement(id); toast.success("Deactivated"); load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id); toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Announcements</h2>
          <p className="text-sm text-ink-400 mt-0.5">Broadcast messages to all or specific libraries</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={load} loading={loading}><RefreshCw size={13}/></Button>
          <Button onClick={()=>setShowCreate(true)}><Plus size={14}/> New Announcement</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <Table>
            <THead><tr><TH>Title</TH><TH>Type</TH><TH>Target</TH><TH>Status</TH><TH>Expires</TH><TH>Created</TH><TH className="text-right">Actions</TH></tr></THead>
            <TBody>
              {loading
                ? Array.from({length:4}).map((_,i)=><TR key={i}>{Array.from({length:7}).map((_,j)=><TD key={j}><div className="h-3 bg-ink-700 rounded animate-pulse"/></TD>)}</TR>)
                : items.length===0
                  ? <tr><td colSpan={7}><EmptyState icon={<Megaphone size={24}/>} title="No announcements" description="Create an announcement to broadcast to libraries."/></td></tr>
                  : items.map(a=>(
                    <TR key={a.id}>
                      <TD className="font-medium text-ink-100">{a.title}</TD>
                      <TD><Badge tone={TYPE_TONE[a.type]||"info"}>{a.type?.replace("_"," ")}</Badge></TD>
                      <TD className="text-ink-400 text-xs">{a.targetLibraryName||"All Libraries"}</TD>
                      <TD><Badge tone={a.active?"success":"danger"}>{a.active?"Active":"Inactive"}</Badge></TD>
                      <TD className="text-ink-400 text-xs">{a.expiresAt ? new Date(a.expiresAt).toLocaleDateString("en-IN") : "Never"}</TD>
                      <TD className="text-ink-500 text-xs">{a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : "—"}</TD>
                      <TD className="text-right">
                        <div className="flex gap-1 justify-end">
                          {a.active && <Button size="sm" variant="secondary" onClick={()=>handleDeactivate(a.id)}><Power size={12}/></Button>}
                          <Button size="sm" variant="danger" onClick={()=>handleDelete(a.id)}><Trash2 size={12}/></Button>
                        </div>
                      </TD>
                    </TR>
                  ))
              }
            </TBody>
          </Table>
        </CardBody>
      </Card>

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create Announcement" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-ink-400 mb-1">Title *</label>
            <input className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
              value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Announcement title"/>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">Type</label>
            <select className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
              value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
              {TYPES.map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">Content *</label>
            <textarea rows={4} className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400 resize-none"
              value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Message content..."/>
          </div>
          <div>
            <label className="block text-xs text-ink-400 mb-1">Expires At (optional)</label>
            <input type="datetime-local" className="w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-amber-400"
              value={form.expiresAt} onChange={e=>setForm(p=>({...p,expiresAt:e.target.value}))}/>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={()=>setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Publish</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
