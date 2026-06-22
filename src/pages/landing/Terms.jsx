import PageHero from "../../components/landing/PageHero";

const SECTIONS = [
  { h: "1. Acceptance of terms", p: "By registering a library or student account on StudyHub, you agree to these terms and to operate within applicable Indian law." },
  { h: "2. Account responsibilities", p: "Library admins are responsible for the accuracy of student data entered into the platform and for managing access to their admin credentials." },
  { h: "3. Subscription & billing", p: "Plans renew monthly unless cancelled. Exceeding your student limit may move your library into a grace period before features are restricted." },
  { h: "4. Data ownership", p: "Library admins retain ownership of all student, fee, and attendance data entered into their library's workspace." },
  { h: "5. Acceptable use", p: "You may not use StudyHub to store data unrelated to library operations, or to circumvent the per-tenant isolation between libraries." },
  { h: "6. Termination", p: "Either party may terminate the service per the cancellation terms in your plan. Data export is available for 30 days after cancellation." },
];

export default function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="Last updated: 1 June 2026" />
      <section className="max-w-2xl mx-auto px-5 lg:px-8 pb-24 space-y-7">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="text-ink-50 font-medium mb-2">{s.h}</h2>
            <p className="text-sm text-ink-400 leading-relaxed">{s.p}</p>
          </div>
        ))}
      </section>
    </>
  );
}
