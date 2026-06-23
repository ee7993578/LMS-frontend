import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Armchair, Search, MapPin, Hash, Pencil, Check, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import { Input, Select, Label } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/Feedback";
import SeatCard from "../../components/seat/SeatCard";
import SeatActionModal from "./SeatActionModal";
import { getAllSeats, createSeat, updateSeat } from "../../api/seatApi";

const STATUS_FILTERS = [
  { value: "ALL", label: "All seats" },
  { value: "AVAILABLE", label: "Available" },
  { value: "ALLOCATED", label: "Occupied" },
  { value: "UNDER_MAINTENANCE", label: "Maintenance" },
];

// Given existing seats for a location, compute the next prefix letter (A, B, C, ...)
function getLocationPrefix(locationIndex) {
  // 0 -> A, 1 -> B, ... 25 -> Z, 26 -> AA, etc.
  let idx = locationIndex;
  let result = "";
  do {
    result = String.fromCharCode(65 + (idx % 26)) + result;
    idx = Math.floor(idx / 26) - 1;
  } while (idx >= 0);
  return result;
}

// Generate seat names: prefix + 1, prefix + 2, ...
function generateSeatNames(prefix, count, startFrom = 1) {
  return Array.from({ length: count }, (_, i) => `${prefix}${startFrom + i}`);
}

export default function SeatMap() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add seat form state
  const [step, setStep] = useState(1); // 1: location, 2: count, 3: preview
  const [newLocation, setNewLocation] = useState("");
  const [isNewLocation, setIsNewLocation] = useState(true);
  const [seatCount, setSeatCount] = useState(1);
  const [previewNames, setPreviewNames] = useState([]);
  const [editingNames, setEditingNames] = useState({}); // index -> custom name

  // Inline rename state
  const [renamingSeat, setRenamingSeat] = useState(null); // seat object
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);

  const fetchSeats = useCallback(() => {
    setLoading(true);
    getAllSeats()
      .then(({ data }) => setSeats(data || []))
      .catch(() => toast.error("Couldn't load seats", { id: "load-seats" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSeats(); }, [fetchSeats]);

  // Unique locations from existing seats
  const existingLocations = useMemo(() => {
    const locs = [...new Set(seats.map((s) => s.location).filter(Boolean))];
    return locs;
  }, [seats]);

  // When location confirmed, compute prefix + preview names
  useEffect(() => {
    if (!newLocation || step < 2) return;
    const locIndex = existingLocations.indexOf(newLocation);
    // If it's a new location, use next available prefix; if existing, continue from highest number
    let prefix;
    if (locIndex === -1) {
      // New location — assign next letter based on total unique locations
      prefix = getLocationPrefix(existingLocations.length);
    } else {
      prefix = getLocationPrefix(locIndex);
    }
    // Find highest existing number for this location+prefix
    const existing = seats.filter((s) => s.location === newLocation && s.seatName?.startsWith(prefix));
    let startFrom = 1;
    if (existing.length > 0) {
      const nums = existing.map((s) => {
        const n = parseInt(s.seatName?.replace(prefix, "") || "0");
        return isNaN(n) ? 0 : n;
      });
      startFrom = Math.max(...nums) + 1;
    }
    const names = generateSeatNames(prefix, Math.max(1, seatCount), startFrom);
    setPreviewNames(names);
    setEditingNames({});
  }, [newLocation, seatCount, step, existingLocations, seats]);

  const resetAddForm = () => {
    setStep(1);
    setNewLocation("");
    setIsNewLocation(true);
    setSeatCount(1);
    setPreviewNames([]);
    setEditingNames({});
  };

  const handleAddSeats = async () => {
    if (!newLocation) return toast.error("Location required");
    if (seatCount < 1) return toast.error("At least 1 seat");
    setSaving(true);
    try {
      const names = previewNames.map((n, i) => editingNames[i] ?? n);
      await Promise.all(
        names.map((seatName) => createSeat({ seatName, location: newLocation, status: "AVAILABLE" }))
      );
      toast.success(`${names.length} seat${names.length > 1 ? "s" : ""} added`);
      setAddOpen(false);
      resetAddForm();
      fetchSeats();
    } catch {
      toast.error("Failed to add seats");
    } finally {
      setSaving(false);
    }
  };

  // Inline rename
  const startRename = (seat, e) => {
    e.stopPropagation();
    setRenamingSeat(seat);
    setRenameValue(seat.seatName);
  };

  const commitRename = async () => {
    if (!renameValue.trim()) return;
    if (renameValue === renamingSeat.seatName) { setRenamingSeat(null); return; }
    setRenameSaving(true);
    try {
      await updateSeat(renamingSeat.id, { ...renamingSeat, seatName: renameValue.trim() });
      toast.success("Seat renamed");
      setRenamingSeat(null);
      fetchSeats();
    } catch {
      toast.error("Failed to rename seat");
    } finally {
      setRenameSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return seats.filter((s) => {
      const statusMatch = statusFilter === "ALL" || s.status === statusFilter;
      const searchMatch =
        s.seatName?.toLowerCase().includes(search.toLowerCase()) ||
        s.location?.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [seats, statusFilter, search]);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink-50">Seat map</h2>
          <p className="text-sm text-ink-400 mt-0.5">{seats.length} seats across your library</p>
        </div>
        <Button onClick={() => { resetAddForm(); setAddOpen(true); }}>
          <Plus size={16} /> Add seats
        </Button>
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
        <p className="text-xs text-ink-500 ml-auto">Click seat → view details &amp; allocate. Pencil → rename.</p>
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
        <EmptyState icon={<Armchair size={26} />} title="No seats found" description="Add your first seat to start building the floor layout." actionLabel="Add seats" onAction={() => { resetAddForm(); setAddOpen(true); }} />
      ) : (
        <div className="space-y-7">
          {Object.entries(grouped).map(([location, seatList]) => (
            <div key={location}>
              <h3 className="text-sm font-medium text-ink-300 mb-3 flex items-center gap-1.5">
                <MapPin size={13} className="text-amber-400" /> {location}
                <span className="text-ink-500 text-xs ml-1">({seatList.length} seats)</span>
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                {seatList.map((seat) =>
                  renamingSeat?.id === seat.id ? (
                    <div key={seat.id} className="aspect-square rounded-xl bg-ink-800 border border-amber-400/40 flex flex-col items-center justify-center gap-1 p-1">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingSeat(null); }}
                        className="w-full bg-transparent text-center text-xs text-ink-50 border-b border-amber-400/60 outline-none px-1"
                      />
                      <div className="flex gap-1">
                        <button onClick={commitRename} disabled={renameSaving} className="h-5 w-5 rounded bg-success/20 text-success flex items-center justify-center"><Check size={10} /></button>
                        <button onClick={() => setRenamingSeat(null)} className="h-5 w-5 rounded bg-danger-soft text-danger flex items-center justify-center"><XIcon size={10} /></button>
                      </div>
                    </div>
                  ) : (
                    <div key={seat.id} className="relative group">
                      <SeatCard seat={seat} onClick={setSelectedSeat} />
                      <button
                        onClick={(e) => startRename(seat, e)}
                        title="Rename seat"
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-ink-700 border border-ink-600 text-ink-300 hover:text-amber-300 hover:border-amber-400/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Pencil size={9} />
                      </button>
                    </div>
                  )
                )}
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

      {/* Smart Add Seats Modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); resetAddForm(); }}
        title="Add seats"
        footer={
          step === 1 ? (
            <>
              <Button variant="secondary" onClick={() => { setAddOpen(false); resetAddForm(); }}>Cancel</Button>
              <Button onClick={() => { if (!newLocation.trim()) return toast.error("Enter location"); setStep(2); }} >Next →</Button>
            </>
          ) : step === 2 ? (
            <>
              <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={() => { if (seatCount < 1) return toast.error("Min 1 seat"); setStep(3); }}>Preview →</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={handleAddSeats} loading={saving}>Add {previewNames.length} seat{previewNames.length > 1 ? "s" : ""}</Button>
            </>
          )
        }
      >
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-ink-400 bg-ink-800 rounded-lg px-3 py-2.5">
              Step 1 of 3 — Choose or create a location
            </p>
            {existingLocations.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setIsNewLocation(false)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${!isNewLocation ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-ink-700 text-ink-400 hover:border-ink-500"}`}
                >
                  Existing location
                </button>
                <button
                  onClick={() => { setIsNewLocation(true); setNewLocation(""); }}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${isNewLocation ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-ink-700 text-ink-400 hover:border-ink-500"}`}
                >
                  New location
                </button>
              </div>
            )}
            {!isNewLocation && existingLocations.length > 0 ? (
              <div>
                <Label required>Select location</Label>
                <Select value={newLocation} onChange={(e) => setNewLocation(e.target.value)}>
                  <option value="">Choose location</option>
                  {existingLocations.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </div>
            ) : (
              <div>
                <Label required>Location name</Label>
                <Input
                  icon={<MapPin size={15} />}
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ground Floor — Reading Hall"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Count */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-ink-400 bg-ink-800 rounded-lg px-3 py-2.5">
              Step 2 of 3 — Location: <span className="text-ink-200 font-medium">{newLocation}</span>
            </p>
            <div>
              <Label required>Number of seats to add</Label>
              <Input
                icon={<Hash size={15} />}
                type="number"
                min={1}
                max={100}
                value={seatCount}
                onChange={(e) => setSeatCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="text-xs text-ink-500 mt-1.5">Names will be auto-generated (e.g. A1, A2, A3 ...)</p>
            </div>
          </div>
        )}

        {/* Step 3: Preview + rename */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-ink-400 bg-ink-800 rounded-lg px-3 py-2.5">
              Step 3 of 3 — Preview &amp; rename if needed (click any name to edit)
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {previewNames.map((name, i) => {
                const displayName = editingNames[i] ?? name;
                return (
                  <input
                    key={i}
                    value={displayName}
                    onChange={(e) => setEditingNames((prev) => ({ ...prev, [i]: e.target.value }))}
                    className="text-center text-xs bg-ink-800 border border-ink-700 focus:border-amber-400/60 rounded-lg py-2 text-ink-100 outline-none transition-colors"
                  />
                );
              })}
            </div>
            <p className="text-xs text-ink-500">
              {previewNames.length} seat{previewNames.length > 1 ? "s" : ""} will be created in <span className="text-ink-300">{newLocation}</span>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
