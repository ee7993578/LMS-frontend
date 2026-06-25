import { useEffect, useState } from "react";
import { Armchair, MapPin, Calendar, Clock, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardBody } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Feedback";
import { getMySeat } from "../../api/studentApi";

function fmt(t) {
  if (!t) return "—";
  const str = typeof t === "string" ? t : String(t);
  const parts = str.split(":");
  const hour = parseInt(parts[0], 10);
  const min = parts[1] || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${min} ${ampm}`;
}

export default function MySeat() {
  const [seat, setSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySeat()
      .then(({ data }) => setSeat(data))
      .catch(() => toast.error("Couldn't load seat info", { id: "student-seat" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">My seat</h2>
          <p className="text-sm text-ink-400 mt-1">Your assigned seat and plan details</p>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (!seat || !seat.seatName) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl text-ink-50">My seat</h2>
          <p className="text-sm text-ink-400 mt-1">Your assigned seat and plan details</p>
        </div>
        <Card className="p-8 text-center">
          <div className="h-20 w-20 rounded-2xl bg-ink-800 text-ink-500 flex items-center justify-center mx-auto mb-4">
            <Armchair size={36} />
          </div>
          <h3 className="font-display text-xl text-ink-300">No seat assigned</h3>
          <p className="text-sm text-ink-500 mt-2">Your library admin will assign you a seat once your plan is set up.</p>
        </Card>
      </div>
    );
  }

  const statusTone = seat.status === "ALLOCATED" ? "success" : seat.status === "AVAILABLE" ? "teal" : "danger";
  const isFixed = seat.allocationMode === "FIXED_HOUR";
  const isFlex = seat.allocationMode === "FLEXIBLE_HOUR";

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">My seat</h2>
        <p className="text-sm text-ink-400 mt-1">Your assigned seat and plan details</p>
      </div>

      <Card className="p-8 text-center">
        <div className="h-20 w-20 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Armchair size={36} />
        </div>
        <h3 className="font-display text-3xl text-ink-50">{seat.seatName}</h3>
        {seat.location && (
          <p className="flex items-center justify-center gap-1.5 text-sm text-ink-400 mt-2">
            <MapPin size={14} /> {seat.location}
          </p>
        )}
        <Badge tone={statusTone} className="mt-4">
          {seat.status === "ALLOCATED" ? "Active" : seat.status || "Assigned"}
        </Badge>
      </Card>

      {/* Allocation details card */}
      <Card>
        <CardBody className="space-y-3">
          <p className="text-xs text-ink-500 uppercase tracking-wide font-medium">Allocation Details</p>

          {seat.planName && (
            <div className="flex items-center gap-3">
              <Layers size={15} className="text-ink-400 shrink-0" />
              <div>
                <p className="text-xs text-ink-500">Plan</p>
                <p className="text-sm text-ink-100">{seat.planName}</p>
              </div>
            </div>
          )}

          {isFixed && seat.slotName && (
            <div className="flex items-center gap-3">
              <Clock size={15} className="text-ink-400 shrink-0" />
              <div>
                <p className="text-xs text-ink-500">Fixed Slot</p>
                <p className="text-sm text-ink-100">
                  {seat.slotName}: {fmt(seat.slotStart)} – {fmt(seat.slotEnd)}
                </p>
              </div>
            </div>
          )}

          {isFlex && seat.flexStartTime && (
            <div className="flex items-center gap-3">
              <Clock size={15} className="text-ink-400 shrink-0" />
              <div>
                <p className="text-xs text-ink-500">Flexible Hours</p>
                <p className="text-sm text-ink-100">
                  {fmt(seat.flexStartTime)} – {fmt(seat.flexEndTime)}
                </p>
              </div>
            </div>
          )}

          {seat.allocatedAt && (
            <div className="flex items-center gap-3">
              <Calendar size={15} className="text-ink-400 shrink-0" />
              <div>
                <p className="text-xs text-ink-500">Allocated On</p>
                <p className="text-sm text-ink-100">
                  {new Date(seat.allocatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          )}

          {!seat.allocationMode && !seat.planName && (
            <p className="text-sm text-ink-400">No additional allocation details available.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
