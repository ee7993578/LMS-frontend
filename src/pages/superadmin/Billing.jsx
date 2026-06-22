import { useEffect, useState } from "react";
import { CreditCard, Download } from "lucide-react";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Badge, { STATUS_TONE } from "../../components/ui/Badge";
import { Table, THead, TH, TBody, TR, TD } from "../../components/ui/Table";
import StatCard from "../../components/ui/StatCard";
import { EmptyState, SkeletonRow } from "../../components/ui/Feedback";
import { getAllLibraries } from "../../api/superAdminApi";
import { formatCurrency } from "../../utils/format";

export default function Billing() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLibraries()
      .then(({ data }) => setLibraries(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = libraries
    .filter((l) => l.libraryPlan)
    .map((l) => ({
      id: l.id,
      library: l.name,
      plan: l.libraryPlan?.planName,
      amount: l.libraryPlan?.planPrice,
      status: l.status === "ACTIVE" ? "PAID" : l.status === "GRACE" ? "PARTIAL" : "UNPAID",
    }));

  const totalMRR = rows.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl text-ink-50">Billing & invoices</h2>
        <p className="text-sm text-ink-400 mt-0.5">Subscription revenue across every library on the platform.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Monthly recurring revenue" value={totalMRR} prefix="₹" tone="amber" icon={<CreditCard size={18} />} />
        <StatCard label="Billed libraries" value={rows.length} tone="teal" />
        <StatCard label="Unbilled libraries" value={libraries.length - rows.length} tone="info" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Library subscriptions</CardTitle>
          <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium">
            <Download size={13} /> Export CSV
          </button>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState icon={<CreditCard size={26} />} title="No billed libraries yet" description="Assign a plan to a library to see it appear here." />
          ) : (
            <Table>
              <THead><tr><TH>Library</TH><TH>Plan</TH><TH>Amount</TH><TH>Status</TH></tr></THead>
              <TBody>
                {rows.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-ink-100 font-medium">{r.library}</TD>
                    <TD>{r.plan}</TD>
                    <TD>{formatCurrency(r.amount)}</TD>
                    <TD><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
