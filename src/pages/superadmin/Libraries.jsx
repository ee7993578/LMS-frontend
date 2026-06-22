import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Building2, Pencil, Trash2, Ban, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import LibraryFormModal from "./LibraryFormModal";
import {
  getAllLibraries, deleteLibrary, changeLibraryStatus,
} from "../../api/superAdminApi";

export default function Libraries() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

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
      toast.success("Library deleted");
      setConfirmDelete(null);
      fetchLibraries();
    } catch {
      toast.error("Failed to delete library");
    }
  };

  const handleStatusChange = async (lib, status) => {
    try {
      await changeLibraryStatus(lib.id, status);
      toast.success(`${lib.name} marked ${status.toLowerCase()}`);
      setOpenMenuId(null);
      fetchLibraries();
    } catch {
      toast.error("Failed to update status");
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
            <TH>Students</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </THead>
        <TBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={5}><SkeletonRow cols={5} /></td></tr>)
          ) : filtered.length === 0 ? (
            <tr><td colSpan={5}>
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
                <TD><Badge tone={STATUS_TONE[lib.status] || "neutral"}>{lib.status}</Badge></TD>
                <TD>{lib.students?.length || 0}</TD>
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
                      <div className="absolute right-4 mt-1 w-48 bg-ink-800 border border-ink-600 rounded-xl shadow-[var(--shadow-soft-lg)] z-20 py-1.5 text-left">
                        <button onClick={() => { setEditing(lib); setFormOpen(true); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-200 hover:bg-ink-700">
                          <Pencil size={14} /> Edit details
                        </button>
                        {lib.status !== "ACTIVE" && (
                          <button onClick={() => handleStatusChange(lib, "ACTIVE")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-success hover:bg-success-soft">
                            <CheckCircle2 size={14} /> Activate
                          </button>
                        )}
                        {lib.status !== "INACTIVE" && (
                          <button onClick={() => handleStatusChange(lib, "INACTIVE")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-warning-soft">
                            <Ban size={14} /> Suspend
                          </button>
                        )}
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
          This will permanently delete <span className="text-ink-50 font-medium">{confirmDelete?.name}</span> and
          all of its students, seats, and fee records. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
