import { useEffect, useRef, useState } from "react";
import { ScanLine, Hand, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { punch, punchWithQR, getMonthAttendance } from "../../api/attendanceApi";
import { formatMinutesToHrs } from "../../utils/format";

function FocusRing({ active, elapsedSeconds }) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="relative h-56 w-56 mx-auto">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#1f2433" strokeWidth="10" />
        <motion.circle
          cx="100" cy="100" r="88" fill="none"
          stroke={active ? "#f5a83c" : "#3b4258"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 88}
          animate={{ strokeDashoffset: active ? (2 * Math.PI * 88) * 0.25 : 2 * Math.PI * 88 * 0.9 }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: active ? Infinity : 0, repeatType: "reverse" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`h-2.5 w-2.5 rounded-full mb-2 ${active ? "bg-success pulse-ring" : "bg-ink-500"}`} />
        <p className="font-mono text-3xl text-ink-50 tabular-nums">{pad(hours)}:{pad(mins)}:{pad(secs)}</p>
        <p className="text-xs text-ink-400 mt-1">{active ? "Studying now" : "Not checked in"}</p>
      </div>
    </div>
  );
}

function QrScannerModal({ open, onClose, onScan }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink-950/85" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-ink-900 rounded-2xl border border-ink-700 p-6 text-center">
            <button onClick={onClose} className="absolute right-4 top-4 text-ink-400 hover:text-ink-100"><X size={18} /></button>
            <div className="h-56 w-56 mx-auto rounded-2xl border-2 border-dashed border-amber-400/40 flex items-center justify-center relative overflow-hidden bg-ink-800">
              <Camera size={32} className="text-ink-500" />
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-amber-400"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-sm text-ink-400 mt-5">Point your camera at the library's desk QR code</p>
            <Button className="w-full mt-4" onClick={() => onScan("LIBRARY_DESK_QR_DEMO")}>
              Simulate scan (demo)
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function PunchInOut() {
  const [punching, setPunching] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    getMonthAttendance().then(({ data }) => {
      const today = new Date().toDateString();
      const todayRecord = (data || []).find((r) => new Date(r.attendanceDate).toDateString() === today);
      if (todayRecord?.attendanceStatus === "IN") {
        setIsCheckedIn(true);
        const startedAt = new Date(todayRecord.shiftStart).getTime();
        setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isCheckedIn) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn]);

  const handlePunch = async () => {
    setPunching(true);
    try {
      const { data } = await punch();
      if (data.attendanceStatus === "IN") {
        setIsCheckedIn(true);
        setElapsed(0);
        toast.success("Punched in — happy studying!");
      } else {
        setIsCheckedIn(false);
        toast.success(`Punched out — ${formatMinutesToHrs(data.totalStudyMinutes)} logged`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Punch failed. Try again.");
    } finally {
      setPunching(false);
    }
  };

  const handleQrScan = async (value) => {
    setScannerOpen(false);
    setPunching(true);
    try {
      const { data } = await punchWithQR(value);
      setIsCheckedIn(data.attendanceStatus === "IN");
      if (data.attendanceStatus === "IN") setElapsed(0);
      toast.success(data.attendanceStatus === "IN" ? "Punched in via QR" : "Punched out via QR");
    } catch {
      toast.error("QR punch failed — try manual punch instead");
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Punch in / out</h2>
        <p className="text-sm text-ink-400 mt-1">Track your study session in real time</p>
      </div>

      <Card className="p-8">
        <FocusRing active={isCheckedIn} elapsedSeconds={elapsed} />

        <Button
          size="lg"
          className="w-full mt-8"
          variant={isCheckedIn ? "danger" : "primary"}
          onClick={handlePunch}
          loading={punching}
        >
          <Hand size={18} /> {isCheckedIn ? "Punch out" : "Punch in"}
        </Button>

        <button
          onClick={() => setScannerOpen(true)}
          className="w-full flex items-center justify-center gap-2 mt-3 py-3 rounded-xl border border-ink-600 text-sm text-ink-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors"
        >
          <ScanLine size={16} /> Scan desk QR instead
        </button>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tips for a focused session</CardTitle></CardHeader>
        <CardBody className="space-y-2.5">
          {[
            "Punch in as soon as you sit at your seat — your streak depends on it.",
            "Keep your phone on silent; the timer keeps running in the background.",
            "Punch out before long breaks so your study-hour stats stay accurate.",
          ].map((t) => (
            <p key={t} className="text-sm text-ink-400 leading-relaxed">• {t}</p>
          ))}
        </CardBody>
      </Card>

      <QrScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQrScan} />
    </div>
  );
}
