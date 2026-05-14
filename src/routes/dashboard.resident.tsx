import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet, MessageSquareWarning, ShieldCheck, Megaphone, Car, Building2,
  TrendingUp, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";

export const Route = createFileRoute("/dashboard/resident")({
  head: () => ({ meta: [{ title: "My Dashboard — Communa" }] }),
  component: ResidentDashboard,
});

const recentComplaints = [
  { id: "#C-2041", title: "Lift not working in Block B", date: "2 days ago", tone: "warning" as const, status: "Open" },
  { id: "#C-2018", title: "AC drainage issue in bedroom", date: "1 week ago", tone: "primary" as const, status: "In Progress" },
  { id: "#C-1996", title: "Intercom not working", date: "Resolved · Oct 22", tone: "success" as const, status: "Resolved" },
];

const recentNotices = [
  { title: "Water tank cleaning on Sunday", date: "May 11 · All Blocks", tag: "Important", tone: "warning" as const },
  { title: "Fire drill scheduled — May 22", date: "May 09 · All Blocks", tag: "Safety", tone: "danger" as const },
  { title: "New gym equipment arrived", date: "May 05 · All Blocks", tag: "Amenity", tone: "success" as const },
];

const paymentHistory = [
  { month: "April 2026", amount: "₹4,500", status: "Paid", tone: "success" as const },
  { month: "March 2026", amount: "₹4,500", status: "Paid", tone: "success" as const },
  { month: "February 2026", amount: "₹4,500", status: "Paid", tone: "success" as const },
];

function ResidentDashboard() {
  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back, Anika 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Flat B-302 · Block B · 4 family members
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/resident/complaints"
              className="inline-flex h-10 px-4 items-center gap-2 rounded-lg glass text-sm font-medium hover:bg-foreground/5 transition"
            >
              <MessageSquareWarning className="h-4 w-4" /> Raise Complaint
            </Link>
          </div>
        </div>

        {/* Pending bill banner */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-elegant p-6 sm:p-8 text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/80">May 2026 Maintenance</div>
              <div className="mt-1 text-4xl font-semibold tracking-tight">₹ 4,500</div>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-white/85">
                <Clock className="h-4 w-4" /> Due in 6 days · May 30, 2026
              </div>
            </div>
            <Link
              to="/dashboard/resident/billing"
              className="inline-flex h-11 px-6 items-center rounded-xl glass-dark text-white font-medium hover:bg-white/15 transition"
            >
              Pay Now
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending Bills" value="₹4,500" icon={Wallet} tone="warning" />
          <StatCard label="Open Complaints" value="2" icon={MessageSquareWarning} tone="primary" />
          <StatCard label="Expected Visitors" value="3" icon={ShieldCheck} tone="accent" />
          <StatCard label="Unread Notices" value="5" icon={Megaphone} tone="success" />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Complaints */}
            <Card
              title="My Complaints"
              action={
                <Link
                  to="/dashboard/resident/complaints"
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/15 transition"
                >
                  + New Complaint
                </Link>
              }
            >
              <ul className="divide-y divide-border">
                {recentComplaints.map((c) => (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-foreground/5 shrink-0">
                      <MessageSquareWarning className="h-4 w-4 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.id} · {c.date}</div>
                    </div>
                    <Badge tone={c.tone}>{c.status}</Badge>
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard/resident/complaints"
                className="mt-3 block text-center text-xs text-primary hover:underline"
              >
                View all complaints →
              </Link>
            </Card>

            {/* Notices */}
            <Card
              title="Latest Notices"
              action={
                <Link to="/dashboard/resident/notices" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              }
            >
              <ul className="space-y-2">
                {recentNotices.map((n) => (
                  <li
                    key={n.title}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-foreground/5 transition"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-[image:var(--gradient-primary)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.date}</div>
                    </div>
                    <Badge tone={n.tone}>{n.tag}</Badge>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Bills Paid", value: "12/13", icon: CheckCircle2, color: "var(--success)", pct: 92 },
                { label: "Complaints Resolved", value: "8/10", icon: TrendingUp, color: "var(--primary)", pct: 80 },
                { label: "Notices Read", value: "18/23", icon: AlertCircle, color: "var(--warning)", pct: 78 },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl glass shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4" style={{ color: `oklch(from ${s.color} l c h)` }} />
                  </div>
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.pct}%`, background: `oklch(from ${s.color} l c h)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Flat summary */}
            <Card title="My Flat">
              <div className="space-y-3">
                {[
                  { label: "Flat Number", value: "B-302" },
                  { label: "Block", value: "Block B" },
                  { label: "Floor", value: "3rd Floor" },
                  { label: "Area", value: "1,620 sq ft" },
                  { label: "Family Members", value: "4" },
                  { label: "Resident Since", value: "Aug 2023" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/resident/flat"
                className="mt-4 block text-center text-xs text-primary hover:underline"
              >
                View flat details →
              </Link>
            </Card>

            {/* Parking */}
            <Card title="My Parking">
              <div className="rounded-xl bg-[image:var(--gradient-primary)] p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Car className="h-6 w-6" />
                  <Badge tone="muted">Assigned</Badge>
                </div>
                <div className="text-2xl font-semibold">P-042</div>
                <div className="text-sm text-white/80 mt-1">Basement Level 1</div>
                <div className="mt-3 text-xs text-white/70">MH-12 AB-1234 · Honda City</div>
              </div>
              <Link
                to="/dashboard/resident/parking"
                className="mt-3 block text-center text-xs text-primary hover:underline"
              >
                View parking details →
              </Link>
            </Card>

            {/* Payment history */}
            <Card
              title="Payment History"
              action={
                <Link to="/dashboard/resident/billing" className="text-xs text-primary hover:underline">
                  All bills
                </Link>
              }
            >
              <ul className="space-y-2.5">
                {paymentHistory.map((p) => (
                  <li key={p.month} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{p.month}</div>
                      <div className="text-xs text-muted-foreground">{p.amount}</div>
                    </div>
                    <Badge tone={p.tone}>{p.status}</Badge>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Pre-approve visitor */}
            <Card title="Pre-approve Visitor">
              <div className="space-y-2.5">
                <input
                  placeholder="Visitor name"
                  className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  placeholder="Phone number"
                  className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  type="datetime-local"
                  className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <button className="w-full h-10 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium hover:shadow-glow transition">
                  Generate Pass
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
