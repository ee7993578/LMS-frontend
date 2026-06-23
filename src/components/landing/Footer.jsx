import { Link } from "react-router-dom";
import { BookOpenText, Send, MessageCircle, Share2 } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { to: "/features", label: "Features" },
      { to: "/pricing", label: "Pricing" },
      { to: "/register-library", label: "Register your library" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/blog", label: "Blog" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center text-white">
                <BookOpenText size={18} strokeWidth={2.25} />
              </div>
              <span className="font-display text-lg text-ink-50">StudyHub</span>
            </Link>
            <p className="text-sm text-ink-400 max-w-xs leading-relaxed">
              The operating system for India's reading libraries, UPSC dens, and student co-working spaces.
            </p>
            <div className="flex gap-3 mt-5">
              {[Send, MessageCircle, Share2].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center text-ink-400 hover:text-amber-300 hover:border-amber-400/40 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink-100 mb-3.5">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-ink-400 hover:text-amber-300 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-700 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-500">© {new Date().getFullYear()} StudyHub ERP. All rights reserved.</p>
          <p className="text-xs text-ink-500">Made for libraries, study centers & co-working spaces across India.</p>
        </div>
      </div>
    </footer>
  );
}
