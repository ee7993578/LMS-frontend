import { useEffect, useMemo, useState } from "react";
import { Plus, Armchair, Search } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Label } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/Feedback";
import SeatCard from "../../components/seat/SeatCard";
import SeatActionModal from "./SeatActionModal";
import { getAllSeats, createSeat } from "../../api/seatApi";

const STATUS_FILTERS = [
  { value: "ALL", label: "All seats" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ALLOCATED", label: "Occupied" },
  { value: "UNDER_MAINTENANCE", label: "Maintenance" },
];

export default function SeatMap() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newSeat, setNewSeat] = useState({ seatName: "", location: "" });
  const [saving, setSaving] = useState(false);

  const fetchSeats = () => {
    setLoading(true);
    getAllSeats().then(({ data }) => setSeats(data || [])).catch(() => toast.error("Couldn't load seats", { id: "load-seats" })).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSeats(); }, []);

  const filtered = useMemo(() => {
    return seats.filter((s) => {
      const statusMatch = statusFilter === "ALL" || s.status === statusFilter;
      const searchMatch = s.seatName?.toLowerCase().includes(search.toLowerCase()) || s.location?.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [seats, statusFilter, search]);

  // Group seats by location for a "floor layout" feel
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((s) => {
      const key = s.location || "Unassigned area";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filtered]);

  const counts = {
    AVAILABLE: seats.filter((s) => s.status === "AVAILABLE").length,
    ALLOCATED: seats.filter((s) => s.status === "ALLOCATED").length,
    UNDER_MAINTENANCE: seats.filter((s) => s.status === "UNDER_MAINTENANCE").length,
  };

  const handleAddSeat = async (e) => {
    e.preventDefault();
    if (!newSeat.seatName || !newSeat.location) return toast.error("Seat name and location are required");
    setSaving(true);
    try {
      await createSeat({ ...newSeat, status: "AVAILABLE" });
      toast.success("Seat added");
      setAddOpen(false);
      setNewSeat({ seatName: "", location: "" });
      fetchSeats();
    } catch {
      toast.error("Failed to add seat");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Seat map</h2>
          <p className="text-sm text-ink-400 mt-0.5">{seats.length} seats across your library</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add seat</Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-success" /> Available <span className="text-ink-500">({counts.AVAILABLE})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-info" /> Occupied <span className="text-ink-500">({counts.ALLOCATED})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Maintenance <span className="text-ink-500">({counts.UNDER_MAINTENANCE})</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="max-w-xs flex-1">
          <Input icon={<Search size={16} />} placeholder="Search seat or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-ink-800 animate-pulse" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={<Armchair size={26} />} title="No seats found" description="Add your first seat to start building the floor layout." actionLabel="Add seat" onAction={() => setAddOpen(true)} />
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).map(([location, seatList]) => (
            <div key={location}>
              <h3 className="text-sm font-medium text-ink-300 mb-3">{location}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {seatList.map((seat) => (
                  <SeatCard key={seat.id} seat={seat} onClick={setSelectedSeat} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SeatActionModal
        open={!!selectedSeat}
        seat={selectedSeat}
        onClose={() => setSelectedSeat(null)}
        onChanged={() => { setSelectedSeat(null); fetchSeats(); }}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a new seat"
        footer={<>
          <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSeat} loading={saving}>Add seat</Button>
        </>}
      >
        <form className="space-y-4" onSubmit={handleAddSeat}>
          <div>
            <Label required>Seat name</Label>
            <Input value={newSeat.seatName} onChange={(e) => setNewSeat({ ...newSeat, seatName: e.target.value })} placeholder="A-14" />
          </div>
          <div>
            <Label required>Location / Floor</Label>
            <Input value={newSeat.location} onChange={(e) => setNewSeat({ ...newSeat, location: e.target.value })} placeholder="Ground Floor — Reading Hall" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
