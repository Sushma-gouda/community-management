import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Plus, Download, FileText, Loader2 } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import {
  Field,
  FilterPill,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  SelectInput,
  TextInput,
} from "@/components/dashboard/PageHeader";
import { 
  fetchBillsAll, 
  createBillsBulk, 
  fetchBlocks, 
  fetchFlatsWithBlocks
} from "@/services/supabase/community";

export const Route = createFileRoute("/dashboard/admin/billing")({
  head: () => ({ meta: [{ title: "Billing — Communa Admin" }] }),
  component: BillingPage,
});

type BillStatus = "Paid" | "Pending" | "Overdue";
type Bill = {
  id: string;
  flat: string;
  resident: string;
  amount: number;
  due: string;
  status: BillStatus;
  type: string;
  raw_id: number | string;
};

const statusMap: Record<string, BillStatus> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

function BillingPage() {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [status, setStatus] = useState<"All" | BillStatus>("All");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "Maintenance",
    target: "all",
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    amount: 4500,
  });

  async function loadData() {
    setLoading(true);
    try {
      const [billsRows, flats, blockRows] = await Promise.all([
        fetchBillsAll(),
        fetchFlatsWithBlocks(),
        fetchBlocks(),
      ]);

      setBlocks(blockRows);
      
      const mapped = billsRows.map((b) => {
        const flat = (flats as any[]).find(f => String(f.id) === String(b.flat_id));
        return {
          id: `INV-${String(b.id).slice(0, 4).toUpperCase()}`,
          raw_id: b.id,
          flat: flat?.flat_number || "N/A",
          resident: flat?.owner_name || "Resident",
          amount: Number(b.amount),
          due: b.due_date ? new Date(b.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A",
          status: statusMap[b.status] || "Pending",
          type: "Maintenance", // Default since 'label' is missing
        };
      });
      setData(mapped);
    } catch (err) {
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    setSubmitting(true);
    try {
      const { count, error } = await createBillsBulk({
        target: form.target,
        amount: form.amount,
        due_date: form.dueDate,
        label: form.type, // UI uses this, but backend will ignore if column missing
      });

      if (error) {
        console.error("Error generating bills:", error);
        alert("Error: " + error);
      } else {
        setOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Error generating bills:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(
    () => data.filter((b) => status === "All" || b.status === status),
    [data, status],
  );

  const tone = (s: BillStatus) =>
    s === "Paid" ? "success" : s === "Pending" ? "warning" : "danger";

  const totals = {
    paid: data.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0),
    pending: data.filter((b) => b.status === "Pending").reduce((s, b) => s + b.amount, 0),
    overdue: data.filter((b) => b.status === "Overdue").reduce((s, b) => s + b.amount, 0),
  };
  const totalAll = totals.paid + totals.pending + totals.overdue;

  const monthlyValues = [62, 70, 58, 80, 72, 88, 76, 92, 84, 90, 96, 88];

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Billing"
          subtitle="Generate, track, and reconcile maintenance bills."
          actions={
            <>
              <GhostButton>
                <Download className="h-4 w-4" /> Export
              </GhostButton>
              <PrimaryButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Generate Bill
              </PrimaryButton>
            </>
          }
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-2xl">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Syncing billing data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI
                label="Total Billed"
                value={`₹${totalAll.toLocaleString()}`}
                sub={`${data.length} invoices`}
                tone="primary"
              />
              <KPI
                label="Collected"
                value={`₹${totals.paid.toLocaleString()}`}
                sub={totalAll > 0 ? `${Math.round((totals.paid / totalAll) * 100)}% of total` : "0% of total"}
                tone="success"
              />
              <KPI label="Pending" value={`₹${totals.pending.toLocaleString()}`} tone="warning" />
              <KPI label="Overdue" value={`₹${totals.overdue.toLocaleString()}`} tone="danger" />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <Card title="Paid vs Pending">
                <PaidVsPending paid={totals.paid} pending={totals.pending} overdue={totals.overdue} />
              </Card>
              <div className="lg:col-span-2">
                <Card title="Monthly Collection">
                  <Bars values={monthlyValues} />
                </Card>
              </div>
            </div>

            <Card title="Invoices">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(["All", "Paid", "Pending", "Overdue"] as const).map((s) => (
                  <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
                    {s}
                  </FilterPill>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="px-2 py-2 font-medium">Invoice</th>
                      <th className="px-2 py-2 font-medium">Flat</th>
                      <th className="px-2 py-2 font-medium">Resident</th>
                      <th className="px-2 py-2 font-medium">Type</th>
                      <th className="px-2 py-2 font-medium">Amount</th>
                      <th className="px-2 py-2 font-medium">Due</th>
                      <th className="px-2 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => (
                      <tr
                        key={b.raw_id}
                        className="border-b border-border last:border-0 hover:bg-foreground/[0.02]"
                      >
                        <td className="px-2 py-3 font-medium flex items-center gap-2">
                          <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/10 text-primary">
                            <FileText className="h-3.5 w-3.5" />
                          </span>
                          {b.id}
                        </td>
                        <td className="px-2 py-3">{b.flat}</td>
                        <td className="px-2 py-3 text-foreground/80">{b.resident}</td>
                        <td className="px-2 py-3 text-foreground/70">{b.type}</td>
                        <td className="px-2 py-3 font-semibold">₹{b.amount.toLocaleString()}</td>
                        <td className="px-2 py-3">
                          <DueIndicator due={b.due} status={b.status} />
                        </td>
                        <td className="px-2 py-3">
                          <Badge tone={tone(b.status)}>{b.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                          No invoices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Generate Bill"
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleGenerate} disabled={submitting}>
              {submitting ? "Generating..." : "Generate"}
            </PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Bill Description (e.g. Maintenance)">
              <TextInput value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
            </Field>
          </div>
          <Field label="Target">
            <SelectInput value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
              <option value="all">All Flats</option>
              {blocks.map(bl => (
                <option key={bl.id} value={bl.id}>Block {bl.name}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Due Date">
            <TextInput type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          </Field>
          <div className="col-span-2">
            <Field label="Amount per Flat (₹)">
              <TextInput type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
            </Field>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function KPI({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: string }) {
  const map: Record<string, string> = {
    primary: "from-primary/20 to-primary/5",
    success: "from-[color:var(--success)]/25 to-[color:var(--success)]/5",
    warning: "from-[color:var(--warning)]/25 to-[color:var(--warning)]/5",
    danger: "from-destructive/25 to-destructive/5",
  };
  return (
    <div className={`rounded-2xl glass shadow-card p-5 bg-gradient-to-br ${map[tone]}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function DueIndicator({ due, status }: { due: string; status: BillStatus }) {
  const color = status === "Overdue" ? "text-destructive" : status === "Pending" ? "text-[color:var(--warning)]" : "text-muted-foreground";
  return <span className={`text-xs font-medium ${color}`}>{due}</span>;
}

function PaidVsPending({ paid, pending, overdue }: { paid: number; pending: number; overdue: number }) {
  const total = paid + pending + overdue || 1;
  const segs = [
    { l: "Paid", v: paid, c: "var(--success)" },
    { l: "Pending", v: pending, c: "var(--warning)" },
    { l: "Overdue", v: overdue, c: "var(--destructive)" },
  ];
  let off = 0;
  const r = 60, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(from var(--foreground) l c h / 0.06)" strokeWidth="20" />
        {segs.map((s, i) => {
          const len = (s.v / total) * c;
          const dash = `${len} ${c - len}`;
          const el = <circle key={i} cx="80" cy="80" r={r} fill="none" stroke={`oklch(from ${s.c} l c h)`} strokeWidth="20" strokeDasharray={dash} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {segs.map((s) => (
          <div key={s.l} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `oklch(from ${s.c} l c h)` }} /> {s.l}
            </span>
            <span className="font-semibold">₹{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bars({ values }: { values: number[] }) {
  const labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  return (
    <div>
      <div className="grid grid-cols-12 gap-2 h-44 items-end">
        {values.map((v, i) => (
          <div key={i} className="rounded-md bg-[image:var(--gradient-primary)] hover:opacity-100 opacity-90 transition" style={{ height: `${v}%` }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-12 gap-2 text-[10px] text-muted-foreground text-center">
        {labels.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)}
      </div>
    </div>
  );
}
