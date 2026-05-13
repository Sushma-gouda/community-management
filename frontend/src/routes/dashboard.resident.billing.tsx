import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  CreditCard,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { FilterPill, PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/resident/billing")({
  head: () => ({ meta: [{ title: "Billing — Communa" }] }),
  component: ResidentBilling,
});

type BillStatus = "Paid" | "Pending" | "Overdue";
type Bill = {
  id: string;
  month: string;
  amount: number;
  due: string;
  status: BillStatus;
  type: string;
  paidOn?: string;
};

const bills: Bill[] = [
  {
    id: "INV-9821",
    month: "May 2026",
    amount: 4500,
    due: "May 30, 2026",
    status: "Pending",
    type: "Maintenance",
  },
  {
    id: "INV-9810",
    month: "April 2026",
    amount: 4500,
    due: "Apr 30, 2026",
    status: "Paid",
    type: "Maintenance",
    paidOn: "Apr 28, 2026",
  },
  {
    id: "INV-9799",
    month: "March 2026",
    amount: 4500,
    due: "Mar 30, 2026",
    status: "Paid",
    type: "Maintenance",
    paidOn: "Mar 27, 2026",
  },
  {
    id: "INV-9788",
    month: "February 2026",
    amount: 4500,
    due: "Feb 28, 2026",
    status: "Paid",
    type: "Maintenance",
    paidOn: "Feb 25, 2026",
  },
  {
    id: "INV-9777",
    month: "January 2026",
    amount: 4500,
    due: "Jan 31, 2026",
    status: "Paid",
    type: "Maintenance",
    paidOn: "Jan 29, 2026",
  },
  {
    id: "INV-9766",
    month: "December 2025",
    amount: 5200,
    due: "Dec 31, 2025",
    status: "Paid",
    type: "Maintenance + Repair",
    paidOn: "Dec 28, 2025",
  },
  {
    id: "INV-9755",
    month: "November 2025",
    amount: 4500,
    due: "Nov 30, 2025",
    status: "Paid",
    type: "Maintenance",
    paidOn: "Nov 27, 2025",
  },
];

function ResidentBilling() {
  const [filter, setFilter] = useState<"All" | BillStatus>("All");
  const [payModal, setPayModal] = useState<Bill | null>(null);
  const [payStep, setPayStep] = useState<"form" | "success">("form");

  const filtered = bills.filter((b) => filter === "All" || b.status === filter);
  const tone = (s: BillStatus) =>
    s === "Paid" ? "success" : s === "Pending" ? "warning" : "danger";

  const pending = bills.filter((b) => b.status === "Pending");
  const totalPaid = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);

  const handlePay = () => {
    setPayStep("success");
    setTimeout(() => {
      setPayModal(null);
      setPayStep("form");
    }, 2000);
  };

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Billing & Payments" subtitle="View and pay your maintenance bills." />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl glass shadow-card p-5 bg-gradient-to-br from-[color:var(--warning)]/20 to-[color:var(--warning)]/5">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--warning)]">
              ₹{pending.reduce((s, b) => s + b.amount, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {pending.length} bill(s) due
            </div>
          </div>
          <div className="rounded-2xl glass shadow-card p-5 bg-gradient-to-br from-[color:var(--success)]/20 to-[color:var(--success)]/5">
            <div className="text-xs text-muted-foreground">Total Paid (2026)</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--success)]">
              ₹{totalPaid.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {bills.filter((b) => b.status === "Paid").length} bills paid
            </div>
          </div>
          <div className="rounded-2xl glass shadow-card p-5">
            <div className="text-xs text-muted-foreground">Monthly Charge</div>
            <div className="mt-2 text-2xl font-semibold">₹4,500</div>
            <div className="text-[11px] text-muted-foreground mt-1">Maintenance fee</div>
          </div>
          <div className="rounded-2xl glass shadow-card p-5">
            <div className="text-xs text-muted-foreground">Payment Rate</div>
            <div className="mt-2 text-2xl font-semibold">100%</div>
            <div className="text-[11px] text-muted-foreground mt-1">On-time payments</div>
          </div>
        </div>

        {/* Pending bills */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Bills
            </h2>
            {pending.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl glass shadow-card p-5 border border-[color:var(--warning)]/30 bg-gradient-to-r from-[color:var(--warning)]/5 to-transparent"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid place-items-center h-12 w-12 rounded-xl bg-[color:var(--warning)]/15 text-[color:var(--warning)] shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {b.month} — {b.type}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {b.id} · Due: {b.due}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-semibold">₹{b.amount.toLocaleString()}</div>
                      <Badge tone="warning">Pending</Badge>
                    </div>
                    <button
                      onClick={() => setPayModal(b)}
                      className="h-10 px-5 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All bills table */}
        <Card
          title="Payment History"
          action={
            <div className="flex items-center gap-2">
              <button className="inline-flex h-8 px-3 items-center gap-1.5 rounded-lg glass text-xs font-medium hover:bg-foreground/5 transition">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(["All", "Paid", "Pending", "Overdue"] as const).map((s) => (
              <FilterPill key={s} active={filter === s} onClick={() => setFilter(s)}>
                {s}
              </FilterPill>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-medium">Invoice</th>
                  <th className="px-2 py-2 font-medium">Month</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Due Date</th>
                  <th className="px-2 py-2 font-medium">Paid On</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border last:border-0 hover:bg-foreground/[0.02]"
                  >
                    <td className="px-2 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/10 text-primary">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        {b.id}
                      </div>
                    </td>
                    <td className="px-2 py-3">{b.month}</td>
                    <td className="px-2 py-3 text-foreground/70">{b.type}</td>
                    <td className="px-2 py-3 font-semibold">₹{b.amount.toLocaleString()}</td>
                    <td className="px-2 py-3 text-foreground/70">{b.due}</td>
                    <td className="px-2 py-3 text-foreground/70">{b.paidOn ?? "—"}</td>
                    <td className="px-2 py-3">
                      <Badge tone={tone(b.status)}>{b.status}</Badge>
                    </td>
                    <td className="px-2 py-3 text-right">
                      {b.status === "Paid" ? (
                        <button className="text-xs text-primary hover:underline">Receipt</button>
                      ) : (
                        <button
                          onClick={() => setPayModal(b)}
                          className="text-xs px-3 py-1.5 rounded-md bg-[image:var(--gradient-primary)] text-white font-medium"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setPayModal(null);
              setPayStep("form");
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in">
            {payStep === "success" ? (
              <div className="text-center py-6">
                <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="text-xl font-semibold">Payment Successful!</div>
                <div className="text-sm text-muted-foreground mt-2">
                  ₹{payModal.amount.toLocaleString()} paid for {payModal.month}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold">Pay Bill</h3>
                  <button
                    onClick={() => setPayModal(null)}
                    className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-xl bg-foreground/[0.03] p-4 mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {payModal.month} — {payModal.type}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {payModal.id} · Due: {payModal.due}
                      </div>
                    </div>
                    <div className="text-2xl font-semibold">
                      ₹{payModal.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Select Payment Method
                  </div>
                  {[
                    { id: "upi", label: "UPI", desc: "Pay via UPI ID or QR code" },
                    { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
                    { id: "netbanking", label: "Net Banking", desc: "All major banks supported" },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="method"
                        defaultChecked={m.id === "upi"}
                        className="accent-[oklch(from_var(--primary)_l_c_h)]"
                      />
                      <div>
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setPayModal(null)}
                    className="h-10 px-4 rounded-lg text-sm font-medium hover:bg-foreground/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePay}
                    className="h-10 px-5 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" /> Pay ₹{payModal.amount.toLocaleString()}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
