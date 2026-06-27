import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2, User, Phone, Mail, Users, MapPin,
  Camera, FileText, CheckCircle2, ArrowLeft, Loader2, Upload, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { validateLibraryCode, submitStudentRegistration } from "../../api/registrationApi";

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Library", "Details", "Done"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors
            ${i < current ? "bg-green-500 text-white" : i === current ? "bg-amber-400 text-ink-900" : "bg-ink-700 text-ink-400"}`}>
            {i < current ? <CheckCircle2 size={14}/> : i + 1}
          </div>
          <span className={`ml-1.5 text-xs font-medium mr-4 ${i === current ? "text-amber-300" : "text-ink-500"}`}>{label}</span>
          {i < steps.length - 1 && <div className={`w-8 h-px mr-4 ${i < current ? "bg-green-500" : "bg-ink-700"}`}/>}
        </div>
      ))}
    </div>
  );
}

// ── File Upload field ─────────────────────────────────────────────────────────
function FileUpload({ label, icon, onChange, preview, optional = true }) {
  return (
    <div>
      <label className="block text-xs text-ink-400 mb-1.5">
        {label} {optional && <span className="text-ink-600">(Optional)</span>}
      </label>
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink-600 rounded-xl p-4 cursor-pointer hover:border-amber-400/50 transition-colors">
        {preview
          ? <img src={preview} alt="preview" className="w-20 h-20 rounded-xl object-cover"/>
          : <div className="text-ink-500">{icon}</div>}
        <span className="text-xs text-ink-400">Click to upload {label}</span>
        <input type="file" accept="image/*" className="hidden" onChange={onChange}/>
      </label>
    </div>
  );
}

export default function StudentRegister() {
  const { code: codeFromUrl } = useParams();
  const navigate = useNavigate();

  const [step, setStep]           = useState(0); // 0=library, 1=form, 2=done
  const [code, setCode]           = useState(codeFromUrl || "");
  const [library, setLibrary]     = useState(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);

  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", fatherName: "", address: ""
  });
  const [photo, setPhoto]         = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aadhar, setAadhar]       = useState(null);
  const [aadharPreview, setAadharPreview] = useState(null);

  // Auto-validate if code came from URL
  useEffect(() => {
    if (codeFromUrl) handleValidate(codeFromUrl);
  }, [codeFromUrl]);

  const handleValidate = async (c = code) => {
    const trimmed = (c || "").trim().toUpperCase();
    if (!trimmed) return toast.error("Enter library code");
    setValidating(true);
    try {
      const { data } = await validateLibraryCode(trimmed);
      setLibrary(data);
      setCode(trimmed);
      setStep(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid library code");
    } finally {
      setValidating(false);
    }
  };

  const handleFileChange = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File must be under 5 MB");
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error("Student name is required");

    const fd = new FormData();
    fd.append("libraryCode", code);
    fd.append("fullName", form.fullName.trim());
    if (form.phone.trim())      fd.append("phone",      form.phone.trim());
    if (form.email.trim())      fd.append("email",      form.email.trim());
    if (form.fatherName.trim()) fd.append("fatherName", form.fatherName.trim());
    if (form.address.trim())    fd.append("address",    form.address.trim());
    if (photo)                  fd.append("photo",      photo);
    if (aadhar)                 fd.append("aadharPhoto", aadhar);

    setSubmitting(true);
    try {
      const { data } = await submitStudentRegistration(fd);
      setResult(data);
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputCls = "w-full bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400 transition-colors";

  // ── Step 0: Library Code ──────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-400/20">
            <Building2 size={28} className="text-amber-400"/>
          </div>
          <h1 className="text-2xl font-display font-bold text-ink-50">Join a Library</h1>
          <p className="text-sm text-ink-400 mt-2">Enter the Library Code provided by your library admin</p>
        </div>

        <div className="bg-ink-900 rounded-2xl p-6 border border-ink-700 space-y-5">
          <div>
            <label className="block text-xs font-medium text-ink-400 mb-2">Library Code <span className="text-red-400">*</span></label>
            <input
              className={`${inputCls} text-center text-lg font-mono tracking-widest uppercase`}
              placeholder="LIB-XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleValidate()}
              maxLength={12}
            />
            <p className="text-xs text-ink-600 mt-2 text-center">Ask your library admin for this code</p>
          </div>

          <button
            onClick={() => handleValidate()}
            disabled={validating || !code.trim()}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {validating ? <Loader2 size={18} className="animate-spin"/> : <Building2 size={18}/>}
            {validating ? "Verifying..." : "Continue"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-700"/></div>
            <div className="relative flex justify-center"><span className="bg-ink-900 px-3 text-xs text-ink-500">or</span></div>
          </div>

          <Link to="/register" className="flex items-center justify-center gap-2 w-full py-2.5 border border-ink-600 rounded-xl text-sm text-ink-400 hover:text-ink-200 hover:border-ink-500 transition-colors">
            <Building2 size={16}/> Register a New Library
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-ink-300 transition-colors">
            <ArrowLeft size={14}/> Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Step 1: Student Details Form ──────────────────────────────────────────
  if (step === 1) return (
    <div className="min-h-screen bg-ink-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Library banner */}
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-amber-400"/>
          </div>
          <div>
            <p className="font-semibold text-ink-100 text-sm">{library?.libraryName}</p>
            {library?.libraryAddress && <p className="text-xs text-ink-400 mt-0.5">{library.libraryAddress}</p>}
          </div>
          <button onClick={() => setStep(0)} className="ml-auto text-ink-500 hover:text-ink-300">
            <ArrowLeft size={16}/>
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-display font-bold text-ink-50">Student Registration</h1>
          <p className="text-xs text-ink-500 mt-1">
            {library?.requireAdminApproval
              ? "Admin will review and approve your registration"
              : "Registration will be auto-approved"}
          </p>
        </div>

        <Steps current={1}/>

        <form onSubmit={handleSubmit} className="bg-ink-900 rounded-2xl p-6 border border-ink-700 space-y-4">

          {/* Required */}
          <div className="bg-ink-800/50 rounded-xl p-3 border border-ink-700">
            <p className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
              <AlertCircle size={12}/> Required Information
            </p>
            <div>
              <label className="block text-xs text-ink-400 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-ink-500"/>
                <input className={`${inputCls} pl-9`} placeholder="Enter student full name"
                  value={form.fullName} onChange={f("fullName")} required/>
              </div>
            </div>
          </div>

          {/* Optional fields */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-500 flex items-center gap-1.5">Optional Information</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-ink-400 mb-1.5">Mobile</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-ink-500"/>
                  <input className={`${inputCls} pl-9`} type="tel" placeholder="10-digit mobile"
                    value={form.phone} onChange={f("phone")} maxLength={10}/>
                </div>
              </div>
              <div>
                <label className="block text-xs text-ink-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-ink-500"/>
                  <input className={`${inputCls} pl-9`} type="email" placeholder="Email address"
                    value={form.email} onChange={f("email")}/>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-400 mb-1.5">Father's Name</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-3 text-ink-500"/>
                <input className={`${inputCls} pl-9`} placeholder="Father's full name"
                  value={form.fatherName} onChange={f("fatherName")}/>
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-400 mb-1.5">Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-ink-500"/>
                <textarea rows={2} className={`${inputCls} pl-9 resize-none`} placeholder="Home address"
                  value={form.address} onChange={f("address")}/>
              </div>
            </div>

            {/* Photo uploads */}
            <div className="grid grid-cols-2 gap-3">
              <FileUpload label="Photo" icon={<Camera size={24}/>}
                onChange={handleFileChange(setPhoto, setPhotoPreview)}
                preview={photoPreview}/>
              <FileUpload label="Aadhar" icon={<FileText size={24}/>}
                onChange={handleFileChange(setAadhar, setAadharPreview)}
                preview={aadharPreview}/>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {submitting ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18}/>}
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Step 2: Done ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Steps current={2}/>
        <div className="bg-ink-900 rounded-2xl p-8 border border-ink-700 text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <CheckCircle2 size={36} className="text-green-400"/>
          </div>
          <h2 className="text-xl font-display font-bold text-ink-50">
            {result?.requireAdminApproval ? "Registration Submitted!" : "Registration Successful!"}
          </h2>
          <p className="text-sm text-ink-400">{result?.message}</p>

          {/* Auto-approved: show login creds */}
          {result?.username && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs font-semibold text-amber-400 text-center mb-3">Your Login Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">Username</span>
                <span className="font-mono text-ink-100 font-medium">{result.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">Password</span>
                <span className="font-mono text-amber-300 font-medium">{result.tempPassword}</span>
              </div>
              <p className="text-xs text-ink-500 text-center mt-2">Please change your password after first login</p>
            </div>
          )}

          {/* Pending approval: show waiting state */}
          {result?.requireAdminApproval && (
            <div className="bg-ink-800 rounded-xl p-4 text-sm text-ink-400 space-y-1">
              <p>✅ Your details have been received</p>
              <p>⏳ Admin will review and approve your registration</p>
              <p>📱 You'll receive a notification once approved</p>
            </div>
          )}

          <Link to="/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold rounded-xl transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
