import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import PageHero from "../../components/landing/PageHero";
import { Input, Label, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error("Please fill in every field");
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent — we'll get back to you within a day.");
      setForm({ name: "", email: "", message: "" });
    }, 700);
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk about your library" />

      <section className="max-w-5xl mx-auto px-5 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-[1fr,1.3fr] gap-10">
          <div className="space-y-5">
            {[
              { icon: Mail, label: "Email", value: "hello@studyhub.app" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Office", value: "Meerut, Uttar Pradesh, India" },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <c.icon size={16} />
                </div>
                <div>
                  <p className="text-xs text-ink-400">{c.label}</p>
                  <p className="text-sm text-ink-100 font-medium">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-700 bg-ink-850 p-7 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label required>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div>
                <Label required>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <Label required>Message</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your library..." />
            </div>
            <Button type="submit" className="w-full" loading={sending}>Send message</Button>
          </form>
        </div>
      </section>
    </>
  );
}
