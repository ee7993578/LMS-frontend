import { useEffect, useState } from "react";
import { QrCode, RefreshCw, Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { generateLibraryQR, getLibraryQR } from "../../api/libraryAdminApi";

export default function QrAttendance() {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchExisting = () => {
    setLoading(true);
    getLibraryQR()
      .then(({ data }) => setQr(data))
      .catch(() => setQr(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExisting(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await generateLibraryQR();
      setQr(data);
      toast.success("New QR code generated");
    } catch {
      toast.error("Failed to generate QR code");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl text-ink-50">QR attendance</h2>
        <p className="text-sm text-ink-400 mt-0.5">Print this QR at your library's entrance — students scan it to punch in and out.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.3fr] gap-5">
        <Card>
          <CardHeader><CardTitle>Library QR code</CardTitle></CardHeader>
          <CardBody className="flex flex-col items-center text-center">
            {loading ? (
              <div className="h-56 w-56 rounded-2xl bg-ink-800 animate-pulse" />
            ) : qr ? (
              <div className="p-4 bg-white rounded-2xl">
                <img src={qr} alt="Library attendance QR code" className="h-56 w-56 object-contain" />
              </div>
            ) : (
              <div className="h-56 w-56 rounded-2xl border-2 border-dashed border-ink-600 flex flex-col items-center justify-center text-ink-500 gap-2">
                <QrCode size={32} />
                <p className="text-xs">No QR generated yet</p>
              </div>
            )}

            {qr && (
              <div className="mt-4 w-full bg-ink-800 rounded-xl p-3 text-xs text-center space-y-1">
                <p className="text-ink-500 font-medium">Smart QR — scan from phone</p>
                <p className="text-ink-600 text-[10px]">Students → attendance punch</p>
                <p className="text-ink-600 text-[10px]">New visitors → registration page</p>
              </div>
            )}
            <div className="flex gap-2 mt-4 w-full">
              <Button onClick={handleGenerate} loading={generating} className="flex-1">
                <RefreshCw size={15} /> {qr ? "Regenerate" : "Generate"}
              </Button>
              {qr && (
                <>
                  <Button variant="secondary" size="icon" onClick={() => window.print()}><Printer size={16} /></Button>
                  <a href={qr} download="library-attendance-qr.png">
                    <Button variant="secondary" size="icon"><Download size={16} /></Button>
                  </a>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            {[
              { step: "1", text: "Generate a QR code once and print it at your library entrance." },
              { step: "2", text: "Logged-in students scan it to punch in/out for attendance." },
              { step: "3", text: "New visitors who scan it (not logged in) are redirected to your library's registration page with the code pre-filled." },
              { step: "4", text: "One QR — two purposes: attendance for existing students, registration for new ones." },
              { step: "5", text: "Regenerating the code invalidates the old one for security." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold flex items-center justify-center shrink-0">{s.step}</span>
                <p className="text-sm text-ink-300 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
