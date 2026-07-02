import { Info } from "lucide-react";

/** Small, non-dismissive contextual help — 2-3 lines max, no docs, no long paragraphs. */
export default function PageHelpNote({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-info-soft/60 border border-info/20 px-4 py-3 mb-5 text-sm text-ink-300">
      <Info size={15} className="text-info shrink-0 mt-0.5" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}
