import clsx from "clsx";
import { Armchair, Wrench, User } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_STYLES = {
  AVAILABLE: "bg-success-soft border-success/30 text-success hover:border-success",
  ALLOCATED: "bg-info-soft border-info/30 text-info hover:border-info",
  UNDER_MAINTENANCE: "bg-danger-soft border-danger/30 text-danger hover:border-danger",
};

const STATUS_ICON = {
  AVAILABLE: Armchair,
  ALLOCATED: User,
  UNDER_MAINTENANCE: Wrench,
};

export default function SeatCard({ seat, onClick }) {
  const Icon = STATUS_ICON[seat.status] || Armchair;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(seat)}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 aspect-square transition-colors",
        STATUS_STYLES[seat.status] || "bg-ink-800 border-ink-600 text-ink-400"
      )}
    >
      <Icon size={18} />
      <span className="text-xs font-medium text-ink-100">{seat.seatName}</span>
      {seat.status === "ALLOCATED" && seat.student?.fullName && (
        <span className="text-[10px] text-ink-400 leading-none truncate max-w-full px-1">
          {seat.student.fullName.split(" ")[0]}
        </span>
      )}
    </motion.button>
  );
}
