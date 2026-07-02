import { useEffect, useRef, useState } from "react";
import { ScanLine, Hand, Camera, X, AlertTriangle, Loader2, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import jsQR from "jsqr";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { punch, punchWithQR, getMonthAttendance } from "../../api/attendanceApi";
import { formatMinutesToHrs } from "../../utils/format";
import api from "../../api/axios";

// The backend now tracks every punch-in/punch-out pair of the day as its own "slot"
// (Slot 1, Slot 2, ...) and totalStudyMinutes is always the sum of every slot so far.
// So the day's timer must be seeded from totalStudyMinutes, not from the current
// slot's shiftStart alone — otherwise it looks like it "restarts" on every punch in.
function elapsedSecondsFromAttendance(attendance) {
  if (!attendance) return 0;
  const bankedSeconds = (attendance.totalStudyMinutes || 0) * 60;
  if (attendance.attendanceStatus !== "IN") return bankedSeconds;

  const slots = attendance.slots || [];
  const openSlot = [...slots].reverse().find((s) => !s.punchOut) || null;
  const currentSlotStart = openSlot?.punchIn || attendance.shiftStart;
  if (!currentSlotStart) return bankedSeconds;

  const liveSeconds = Math.max(0, Math.floor((Date.now() - new Date(currentSlotStart).getTime()) / 1000));
  return bankedSeconds + liveSeconds;
}

function formatClock(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Desk QR encodes a full URL like "https://app.brythiq.com/qr/library1-<uuid>".
// The backend only wants the trailing code, so pull it out of a scanned URL;
// if someone encoded a bare code (no URL), just use it as-is.
function extractQrValue(rawText) {
  if (!rawText) return null;
  try {
    const url = new URL(rawText);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("qr");
    if (idx !== -1 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]);
    return parts.length ? decodeURIComponent(parts[parts.length - 1]) : rawText;
  } catch {
    return rawText.trim();
  }
}

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
        <span className={`h-2.5 w-2.5 rounded-full mb-2 ${active ? "bg-success pulse-ring" : "bg-ink-500"}`} />
        <p className="font-mono text-3xl text-ink-50 tabular-nums">{pad(hours)}:{pad(mins)}:{pad(secs)}</p>
        <p className="text-xs text-ink-400 mt-1">{active ? "Studying now" : "Not checked in"}</p>
      </div>
    </div>
  );
}

function QrScannerModal({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scannedRef = useRef(false); // guards against firing onScan twice

  const [cameraState, setCameraState] = useState("idle"); // idle | starting | scanning | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    scannedRef.current = false;
    startCamera();
    return () => {
      document.body.style.overflow = "";
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startCamera = async () => {
    setCameraState("starting");
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not supported on this browser.");
      }
      // Rear camera on phones; falls back to whatever's available.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState("scanning");
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraState("error");
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setErrorMsg("Camera permission denied. Allow camera access in your browser settings and try again.");
      } else if (err?.name === "NotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
        setErrorMsg("Camera needs a secure (https) connection to work.");
      } else {
        setErrorMsg(err?.message || "Could not access camera.");
      }
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraState("idle");
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code?.data && !scannedRef.current) {
      scannedRef.current = true;
      const value = extractQrValue(code.data);
      stopCamera();
      onScan(value);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink-950/85" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-ink-900 rounded-2xl border border-ink-700 p-6 text-center">
            <button onClick={onClose} className="absolute right-4 top-4 text-ink-400 hover:text-ink-100"><X size={18} /></button>

            <div className="h-56 w-56 mx-auto rounded-2xl border-2 border-dashed border-amber-400/40 flex items-center justify-center relative overflow-hidden bg-ink-800">
              {cameraState === "starting" && (
                <div className="flex flex-col items-center gap-2 text-ink-500">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="text-xs">Starting camera...</span>
                </div>
              )}

              {cameraState === "error" && (
                <div className="flex flex-col items-center gap-2 text-red-400 px-4">
                  <AlertTriangle size={28} />
                  <span className="text-xs">{errorMsg}</span>
                </div>
              )}

              {/* Video stays mounted (hidden via opacity) so the ref is always ready to receive a stream */}
              <video
                ref={videoRef}
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover ${cameraState === "scanning" ? "opacity-100" : "opacity-0"}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraState === "scanning" && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            <p className="text-sm text-ink-400 mt-5">
              {cameraState === "error"
                ? "Fix the issue above, then try again."
                : "Point your camera at the library's desk QR code"}
            </p>

            {cameraState === "error" && (
              <Button className="w-full mt-4" onClick={startCamera}>
                Try again
              </Button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SlotsList({ slots }) {
  if (!slots || slots.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Today's sessions</CardTitle></CardHeader>
      <CardBody className="space-y-2.5">
        {slots.map((s) => {
          const ongoing = !s.punchOut;
          return (
            <div
              key={s.slotNumber}
              className="flex items-center justify-between rounded-lg border border-ink-700 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${ongoing ? "bg-success pulse-ring" : "bg-ink-500"}`} />
                <div>
                  <p className="text-sm text-ink-100">Slot {s.slotNumber}</p>
                  <p className="text-xs text-ink-400">
                    {formatClock(s.punchIn)} — {ongoing ? "ongoing" : formatClock(s.punchOut)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-mono text-ink-200 tabular-nums">
                {ongoing ? "…" : formatMinutesToHrs(s.durationMinutes)}
              </span>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

export default function PunchInOut() {
  const [punching, setPunching] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [slots, setSlots] = useState([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState("BOTH"); // NORMAL | QR_CODE | BOTH
  const intervalRef = useRef(null);

  const applyAttendance = (attendance) => {
    if (!attendance) return;
    setIsCheckedIn(attendance.attendanceStatus === "IN");
    setElapsed(elapsedSecondsFromAttendance(attendance));
    setSlots(attendance.slots || []);
  };

  useEffect(() => {
    // Load attendance mode for this student's library
    api.get("/api/student/attendance-mode")
      .then(({ data }) => setAttendanceMode(data.attendanceMode || "BOTH"))
      .catch(() => setAttendanceMode("BOTH"));

    getMonthAttendance().then(({ data }) => {
      const today = new Date().toDateString();
      const todayRecord = (data || []).find((r) => new Date(r.attendanceDate).toDateString() === today);
      if (todayRecord) applyAttendance(todayRecord);
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

  // Punching in never resets the clock — the day's timer keeps going from
  // whatever was already banked (totalStudyMinutes), it just opens a new slot.
  const handlePunch = async () => {
    setPunching(true);
    try {
      const { data } = await punch();
      applyAttendance(data);
      if (data.attendanceStatus === "IN") {
        toast.success(
          data.slots?.length > 1
            ? `Punched in — Slot ${data.slots.length} started, day total resumed`
            : "Punched in — happy studying!"
        );
      } else {
        toast.success(`Punched out — ${formatMinutesToHrs(data.totalStudyMinutes)} logged today`);
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
      applyAttendance(data);
      toast.success(data.attendanceStatus === "IN" ? "Punched in via QR" : "Punched out via QR");
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
      <div className="text-center">
        <h2 className="font-display text-xl text-ink-50">Punch in / out</h2>
        <p className="text-sm text-ink-400 mt-1">Track your study session in real time</p>
      </div>

      <Card className="p-8">
        <FocusRing active={isCheckedIn} elapsedSeconds={elapsed} />
        <p className="text-center text-xs text-ink-500 -mt-4">
          Total studied today{slots.length > 1 ? ` · Slot ${slots.length}` : ""}
        </p>

        {/* Manual punch — shown for NORMAL and BOTH */}
        {showManual && (
          <Button
            size="lg"
            className="w-full mt-8"
            variant={isCheckedIn ? "danger" : "primary"}
            onClick={handlePunch}
            loading={punching}
          >
            <Hand size={18} /> {isCheckedIn ? "Punch out" : "Punch in"}
          </Button>
        )}

        {/* QR scan — shown for QR_CODE and BOTH */}
        {showQR && (
          <button
            onClick={() => setScannerOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ink-600 text-sm text-ink-300 hover:border-amber-400/40 hover:text-amber-300 transition-colors ${showManual ? "mt-3" : "mt-8"}`}
          >
            <ScanLine size={16} />
            {attendanceMode === "QR_CODE" ? "Scan QR to punch" : "Scan desk QR instead"}
          </button>
        )}
      </Card>

      <SlotsList slots={slots} />

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
