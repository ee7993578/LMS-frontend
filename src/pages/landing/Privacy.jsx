import PageHero from "../../components/landing/PageHero";

const SECTIONS = [
  { h: "1. What we collect", p: "Account details (name, username, phone), library and seat configuration, attendance timestamps, and fee records you enter into the platform." },
  { h: "2. How we use it", p: "Solely to operate the platform's features — attendance calculation, fee tracking, reports, and login security." },
  { h: "3. Data isolation", p: "Each library's data is scoped to that library's admin account and is not visible to other libraries on the platform." },
  { h: "4. Third parties", p: "We do not sell student or library data. Data may be processed by infrastructure providers strictly to host the service." },
  { h: "5. Your rights", p: "Library admins can request export or deletion of their library's data at any time by contacting support." },
  { h: "6. Security", p: "Passwords are stored using industry-standard hashing, and access is authenticated via short-lived JWT sessions." },
];

export default function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated: 1 June 2026" />
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
