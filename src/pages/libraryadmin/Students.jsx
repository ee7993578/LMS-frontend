import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Users, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { initials } from "../../utils/format";
import StudentFormModal from "./StudentFormModal";
import StudentProfileDrawer from "./StudentProfileDrawer";
import { getAllStudents, deleteStudent } from "../../api/libraryAdminApi";

const PAGE_SIZE = 8;

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("fullName");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchStudents = () => {
    setLoading(true);
    getAllStudents()
      .then(({ data }) => setStudents(data || []))
      .catch(() => toast.error("Couldn't load students", { id: "load-students" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = useMemo(() => {
    let list = students.filter((s) =>
      [s.fullName, s.email, s.phone].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    );
    list.sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [students, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(confirmDelete.id);
      toast.success("Student removed");
      setConfirmDelete(null);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Students</h2>
          <p className="text-sm text-ink-400 mt-0.5">{students.length} students registered</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Add student
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="max-w-sm flex-1">
          <Input icon={<Search size={16} />} placeholder="Search by name, email, phone..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select className="sm:w-48" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="fullName">Sort: Name</option>
          <option value="email">Sort: Email</option>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Table>
          <THead>
            <tr>
              <TH sortable sortDir={sortKey === "fullName" ? sortDir : null} onSort={() => toggleSort("fullName")}>Student</TH>
              <TH>Contact</TH>
              <TH>Plan</TH>
              <TH>Seat</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </THead>
          <TBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><SkeletonRow cols={6} /></td></tr>)
            ) : pageData.length === 0 ? (
              <tr><td colSpan={6}>
                <EmptyState icon={<Users size={26} />} title="No students found" description={search ? "Try a different search." : "Add your first student to get started."} actionLabel={!search ? "Add student" : undefined} onAction={() => setFormOpen(true)} />
              </td></tr>
            ) : (
              pageData.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-400 text-ink-950 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(s.fullName)}
                      </div>
                      <span className="text-ink-100 font-medium">{s.fullName}</span>
                    </div>
                  </TD>
                  <TD><p>{s.email || "—"}</p><p className="text-xs text-ink-500">{s.phone}</p></TD>
                  <TD>{s.plan?.name || <span className="text-ink-500">None</span>}</TD>
                  <TD>{s.seat?.seatName || <span className="text-ink-500">Unassigned</span>}</TD>
                  <TD><Badge tone={s.active === false ? "neutral" : "success"}>{s.active === false ? "Inactive" : "Active"}</Badge></TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setViewing(s)} className="h-8 w-8 rounded-lg hover:bg-ink-700 inline-flex items-center justify-center text-ink-400"><Eye size={15} /></button>
                      <button onClick={() => { setEditing(s); setFormOpen(true); }} className="h-8 w-8 rounded-lg hover:bg-ink-700 inline-flex items-center justify-center text-ink-400"><Pencil size={14} /></button>
                      <button onClick={() => setConfirmDelete(s)} className="h-8 w-8 rounded-lg hover:bg-danger-soft inline-flex items-center justify-center text-ink-400 hover:text-danger"><Trash2 size={14} /></button>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-2">
              <div className="h-4 rounded bg-ink-700 animate-pulse w-32" />
              <div className="h-3 rounded bg-ink-700 animate-pulse w-48" />
            </div>
          ))
        ) : pageData.length === 0 ? (
          <EmptyState icon={<Users size={26} />} title="No students found" description={search ? "Try a different search." : "Add your first student to get started."} actionLabel={!search ? "Add student" : undefined} onAction={() => setFormOpen(true)} />
        ) : (
          pageData.map((s) => (
            <div key={s.id} className="rounded-xl border border-ink-700 bg-ink-850 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-amber-400 text-ink-950 flex items-center justify-center text-xs font-semibold shrink-0">
                    {initials(s.fullName)}
                  </div>
                  <div>
                    <p className="text-ink-100 font-medium text-sm">{s.fullName}</p>
                    <p className="text-xs text-ink-400">{s.email || "—"}</p>
                  </div>
                </div>
                <Badge tone={s.active === false ? "neutral" : "success"} className="text-xs">
                  {s.active === false ? "Inactive" : "Active"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Plan</p>
                  <p className="text-ink-200">{s.plan?.name || "None"}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Seat</p>
                  <p className="text-ink-200">{s.seat?.seatName || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wide">Phone</p>
                  <p className="text-ink-200">{s.phone || "—"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-ink-700">
                <button onClick={() => setViewing(s)} className="flex-1 py-1.5 rounded-lg text-xs text-ink-400 hover:bg-ink-700 hover:text-ink-100 transition-colors flex items-center justify-center gap-1">
                  <Eye size={13} /> View
                </button>
                <button onClick={() => { setEditing(s); setFormOpen(true); }} className="flex-1 py-1.5 rounded-lg text-xs text-ink-400 hover:bg-ink-700 hover:text-ink-100 transition-colors flex items-center justify-center gap-1">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setConfirmDelete(s)} className="flex-1 py-1.5 rounded-lg text-xs text-ink-400 hover:bg-danger-soft hover:text-danger transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-8 w-8 rounded-lg border border-ink-600 flex items-center justify-center text-ink-300 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-ink-400">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 w-8 rounded-lg border border-ink-600 flex items-center justify-center text-ink-300 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <StudentFormModal open={formOpen} onClose={() => setFormOpen(false)} editing={editing} onSaved={() => { setFormOpen(false); fetchStudents(); }} />
      <StudentProfileDrawer open={!!viewing} onClose={() => setViewing(null)} student={viewing} />

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove student"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Remove</Button>
        </>}
      >
        <p className="text-sm text-ink-300">
          Remove <span className="text-ink-50 font-medium">{confirmDelete?.fullName}</span>? Their seat will be freed and attendance history will be cleared.
        </p>
      </Modal>
    </div>
  );
}
