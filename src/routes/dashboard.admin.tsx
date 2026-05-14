import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, MessageSquareWarning, ShieldCheck, CreditCard, Car, Building2, TrendingUp,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Communa" }] }),
  component: AdminDashboard,
});

const recentComplaints = [
  { id: "#C-2041", title: "Lift not working in Block B", by: "Anika S.", flat: "B-302", status: "open", tone: "warning" as const },
  { id: "#C-2039", title: "Water leakage in lobby", by: "Ravi K.", flat: "A-101", status: "in progress", tone: "primary" as const },
  { id: "#C-2037", title: "Garbage pickup missed", by: "Meera P.", flat: "C-204", status: "resolved", tone: "success" as const },
  { id: "#C-2035", title: "Street light flickering", by: "Sunil J.", flat: "D-405", status: "open", tone: "warning" as const },
];

const recentPayments = [
  { id: "TXN-9821", flat: "A-204", amount: "₹4,500", method: "UPI", status: "success" as const },
  { id: "TXN-9819", flat: "B-105", amount: "₹4,500", method: "Card", status: "success" as const },
  { id: "TXN-9817", flat: "C-301", amount: "₹6,200", method: "Net Banking", status: "primary" as const },
  { id: "TXN-9815", flat: "D-402", amount: "₹4,500", method: "UPI", status: "warning" as const },
];

const timeline = [
  { time: "09:42", title: "New visitor checked in", desc: "Rohit Sharma → A-204", tone: "primary" as const },
  { time: "08:15", title: "Complaint resolved", desc: "Garbage pickup #C-2037", tone: "success" as const },
  { time: "Yesterday", title: "Maintenance bill generated", desc: "All blocks · ₹18,42,500", tone: "accent" as const },
  { time: "Yesterday", title: "Notice published", desc: "Water tank cleaning Sunday", tone: "warning" as const },
];

function AdminDashboard() {
  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Welcome back, Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what's happening across your community today.</p>
          </div>
          <Link
            to="/dashboard/admin/notices"
            className="inline-flex h-10 px-4 items-center rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
          >
            + New Notice
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Residents" value="1,284" change="+24 MoM" icon={Users} tone="primary" />
          <StatCard label="Occupied Flats" value="470/500" change="94% occupancy" icon={Building2} tone="accent" />
          <StatCard label="Pending Complaints" value="12" change="-3 this week" icon={MessageSquareWarning} tone="warning" />
          <StatCard label="Unpaid Bills" value="₹2.4L" change="48 flats due" icon={CreditCard} tone="warning" />
          <StatCard label="Active Visitors" value="47" change="+8 today" icon={ShieldCheck} tone="success" />
          <StatCard label="Parking Usage" value="86%" change="430/500 slots" icon={Car} tone="primary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Maintenance Collections" action={<Badge tone="success">+12.4%</Badge>}>
              <LineChart points={[40, 55, 38, 72, 60, 80, 68, 90, 75, 85, 95, 88]} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} />
            </Card>
          </div>
          <Card title="Visitor Statistics">
            <Donut segments={[
              { label: "Guests", value: 58, color: "var(--primary)" },
              { label: "Delivery", value: 24, color: "var(--accent)" },
              { label: "Cab", value: 12, color: "var(--warning)" },
              { label: "Service", value: 6, color: "var(--success)" },
            ]} />
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Recent Complaints" action={<Link to="/dashboard/admin/complaints" className="text-xs text-primary hover:underline">View all</Link>}>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="px-2 py-2 font-medium">ID</th>
                      <th className="px-2 py-2 font-medium">Title</th>
                      <th className="px-2 py-2 font-medium">Resident</th>
                      <th className="px-2 py-2 font-medium">Flat</th>
                      <th className="px-2 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentComplaints.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                        <td className="px-2 py-3 font-medium">{c.id}</td>
                        <td className="px-2 py-3">{c.title}</td>
                        <td className="px-2 py-3 text-foreground/80">{c.by}</td>
                        <td className="px-2 py-3 text-foreground/80">{c.flat}</td>
                        <td className="px-2 py-3"><Badge tone={c.tone}>{c.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          <Card title="Activity Timeline">
            <ol className="relative space-y-4 ml-2">
              {timeline.map((t, i) => (
                <li key={i} className="pl-5 relative">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[image:var(--gradient-primary)] shadow-glow" />
                  {i !== timeline.length - 1 && <span className="absolute left-[4px] top-4 bottom-[-1rem] w-px bg-border" />}
                  <div className="text-[11px] text-muted-foreground">{t.time}</div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Recent Payments" action={<Link to="/dashboard/admin/billing" className="text-xs text-primary hover:underline">All transactions</Link>}>
            <ul className="space-y-2.5">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/[0.03]">
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-[color:var(--success)]/15 text-[color:var(--success)]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{p.flat} · {p.amount}</div>
                    <div className="text-[11px] text-muted-foreground">{p.id} · {p.method}</div>
                  </div>
                  <Badge tone={p.status}>{p.status === "warning" ? "pending" : "paid"}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Block Occupancy">
            <div className="space-y-3">
              {[
                { b: "Block A", occ: 96, units: "120/125" },
                { b: "Block B", occ: 92, units: "115/125" },
                { b: "Block C", occ: 88, units: "110/125" },
                { b: "Block D", occ: 100, units: "125/125" },
              ].map((b) => (
                <div key={b.b} className="flex items-center gap-3">
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{b.b}</span>
                      <span className="text-muted-foreground text-xs">{b.units}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[image:var(--gradient-primary)]" style={{ width: `${b.occ}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Quick Stats">
            <div className="space-y-4">
              {[
                { label: "Bills paid", value: "82%", color: "var(--success)" },
                { label: "Complaint SLA", value: "76%", color: "var(--warning)" },
                { label: "Visitor approvals", value: "98%", color: "var(--primary)" },
                { label: "Active staff", value: "100%", color: "var(--accent)" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: s.value, background: `oklch(from ${s.color} l c h)` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LineChart({ points, labels }: { points: number[]; labels: string[] }) {
  const w = 600, h = 180, pad = 16;
  const max = Math.max(...points);
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => [pad + i * step, h - pad - (p / max) * (h - pad * 2)] as const);
  const path = coords.map((c, i) => (i ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1)).join(" ");
  const area = path + ` L ${coords[coords.length - 1][0]} ${h - pad} L ${coords[0][0]} ${h - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
        <defs>
          <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(from var(--primary) l c h)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(from var(--primary) l c h)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lc)" />
        <path d={path} fill="none" stroke="oklch(from var(--primary) l c h)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="oklch(from var(--primary-glow) l c h)" />
        ))}
      </svg>
      <div className="mt-1 grid grid-cols-12 gap-1 text-[10px] text-muted-foreground text-center">
        {labels.map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 60, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-36 w-36 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="oklch(from var(--foreground) l c h / 0.06)" strokeWidth="20" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle key={i} cx="80" cy="80" r={r} fill="none"
              stroke={`oklch(from ${s.color} l c h)`} strokeWidth="20"
              strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `oklch(from ${s.color} l c h)` }} />
              <span className="text-foreground/80">{s.label}</span>
            </span>
            <span className="font-semibold">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
