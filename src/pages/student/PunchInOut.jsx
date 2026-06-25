import { useEffect, useRef, useState } from "react";
import { ScanLine, Hand, X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { punch, punchWithQR, getMonthAttendance } from "../../api/attendanceApi";
import { formatMinutesToHrs } from "../../utils/format";
import api from "../../api/axios";

// ─── Focus Ring ───────────────────────────────────────────────────────────────
function FocusRing({ active, elapsedSeconds }) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="relative h-56 w-56 mx-auto">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="10" />
        <motion.circle
          cx="100" cy="100" r="88" fill="none"
          stroke={active ? "#6366f1" : "#475569"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 88}
          animate={{ strokeDashoffset: active ? (2 * Math.PI * 88) * 0.25 : 2 * Math.PI * 88 * 0.9 }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: active ? Infinity : 0, repeatType: "reverse" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`h-2.5 w-2.5 rounded-full mb-2 transition-colors duration-500 ${active ? "bg-emerald-400" : "bg-ink-500"}`} />
        <p className="font-mono text-3xl text-ink-50 tabular-nums">{pad(hours)}:{pad(mins)}:{pad(secs)}</p>
        <p className="text-xs text-ink-400 mt-1">{active ? "Studying now" : "Not checked in"}</p>
      </div>
    </div>
  );
}

// ─── QR Scanner Modal ─────────────────────────────────────────────────────────
function QrScannerModal({ open, onClose, onScan }) {
  const scannerRef = useRef(null);
  const [camError, setCamError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const SCANNER_ID = "qr-reader-view";

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    setCamError(null);
    setScanning(false);

    // Small delay so DOM div mounts before Html5Qrcode tries to access it
    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
          (decodedText) => {
            // Success — stop scanner and bubble up
            html5QrCode.stop().catch(() => {});
            scannerRef.current = null;
            onScan(decodedText);
          },
          () => {} // per-frame errors ignore karo
        )
        .then(() => setScanning(true))
        .catch((err) => {
          console.error("Camera error:", err);
          setCamError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Please allow camera access in browser settings."
              : "Could not start camera. Make sure no other app is using it."
          );
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [open]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/90 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-sm bg-ink-900 rounded-t-3xl sm:rounded-2xl border border-ink-700 p-6 text-center shadow-2xl"
          >
            {/* Handle bar (mobile) */}
            <div className="w-10 h-1 bg-ink-600 rounded-full mx-auto mb-5 sm:hidden" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-ink-800 flex items-center justify-center text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
            >
              <X size={16} />
            </button>

            <p className="text-sm font-medium text-ink-200 mb-1">Scan desk QR code</p>
            <p className="text-xs text-ink-500 mb-4">Point camera at the QR code on your library desk</p>

            {/* Camera view */}
            {camError ? (
              <div className="h-64 rounded-2xl bg-ink-800 border border-red-500/30 flex flex-col items-center justify-center gap-3 px-4">
                <AlertCircle size={28} className="text-red-400" />
                <p className="text-xs text-red-300 leading-relaxed">{camError}</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                {/* Html5Qrcode mounts camera feed here */}
                <div id={SCANNER_ID} className="w-full" />

                {/* Corner brackets overlay */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top-left */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-violet-400 rounded-tl-lg" />
                    {/* Top-right */}
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-violet-400 rounded-tr-lg" />
                    {/* Bottom-left */}
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-violet-400 rounded-bl-lg" />
                    {/* Bottom-right */}
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-violet-400 rounded-br-lg" />

                    {/* Scan line */}
                    <motion.div
                      className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full"
                      animate={{ top: ["15%", "85%", "15%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                )}

                {/* Loading state */}
                {!scanning && !camError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                      <p className="text-xs text-ink-400">Starting camera…</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={handleClose}>
              Cancel
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PunchInOut() {
  const [punching, setPunching] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState("BOTH");
  const intervalRef = useRef(null);

  useEffect(() => {
    api.get("/api/student/attendance-mode")
      .then(({ data }) => setAttendanceMode(data.attendanceMode || "BOTH"))
      .catch(() => setAttendanceMode("BOTH"));

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
      toast.success(
        data.attendanceStatus === "IN"
          ? "Punched in via QR — happy studying!"
          : `Punched out via QR — ${formatMinutesToHrs(data.totalStudyMinutes)} logged`
      );
    } catch {
      toast.error("QR punch failed — try manual punch instead");
    } finally {
      setPunching(false);
    }
  };

  const showManual = attendanceMode === "NORMAL" || attendanceMode === "BOTH";
  const showQR = attendanceMode === "QR_CODE" || attendanceMode === "BOTH";

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Punch in / out</h2>
        <p className="text-sm text-ink-400 mt-1">Track your study session in real time</p>
      </div>

      {/* Main punch card */}
      <Card className="p-8">
        <FocusRing active={isCheckedIn} elapsedSeconds={elapsed} />

        <div className="mt-8 space-y-3">
          {showManual && (
            <Button
              size="lg"
              className="w-full"
              variant={isCheckedIn ? "danger" : "primary"}
              onClick={handlePunch}
              loading={punching}
            >
              <Hand size={18} />
              {isCheckedIn ? "Punch out" : "Punch in"}
            </Button>
          )}

          {showQR && (
            <button
              onClick={() => setScannerOpen(true)}
              disabled={punching}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink-600 text-sm text-ink-300 hover:border-violet-500/50 hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ScanLine size={16} />
              {attendanceMode === "QR_CODE" ? "Scan QR to punch" : "Scan desk QR instead"}
            </button>
          )}
        </div>
      </Card>

      {/* Status badge */}
      <AnimatePresence>
        {isCheckedIn && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 justify-center text-sm text-emerald-400"
          >
            <CheckCircle2 size={15} />
            <span>Session active — don't forget to punch out</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
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

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQrScan}
      />
    </div>
  );
}
