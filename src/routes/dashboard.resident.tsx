import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard, MessageSquareWarning, ShieldCheck, CreditCard, Car, Megaphone,
  Settings, Calendar, Receipt, Wallet,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/resident")({
  head: () => ({ meta: [{ title: "Resident Dashboard — Communa" }] }),
  component: ResidentDashboard,
});

const items = [
  { label: "Overview", to: "/dashboard/resident", icon: LayoutDashboard },
  { label: "My Bills", to: "/dashboard/resident", icon: Receipt },
  { label: "Complaints", to: "/dashboard/resident", icon: MessageSquareWarning },
  { label: "Visitors", to: "/dashboard/resident", icon: ShieldCheck },
  { label: "Parking", to: "/dashboard/resident", icon: Car },
  { label: "Notices", to: "/dashboard/resident", icon: Megaphone },
  { label: "Events", to: "/dashboard/resident", icon: Calendar },
  { label: "Settings", to: "/dashboard/resident", icon: Settings },
];

function ResidentDashboard() {
  return (
    <DashboardLayout role="Resident" items={items}>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Hi, Anika 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">B-302 · Block B · 4 family members</p>
        </div>

        {/* Bill banner */}
        <div className="relative overflow-hidden rounded-2xl shadow-elegant p-6 sm:p-8 text-white"
             style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/80">November Maintenance</div>
              <div className="mt-1 text-4xl font-semibold">₹ 4,250</div>
              <div className="mt-1 text-sm text-white/85">Due in 6 days · Nov 30, 2025</div>
            </div>
            <button className="inline-flex h-11 px-6 items-center rounded-xl glass-dark text-white font-medium hover:bg-white/15 transition">
              Pay Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pending Bills" value="₹ 4,250" icon={Wallet} tone="warning" />
          <StatCard label="Open Complaints" value="2" icon={MessageSquareWarning} tone="primary" />
          <StatCard label="Expected Visitors" value="3" icon={ShieldCheck} tone="accent" />
          <StatCard label="Unread Notices" value="5" icon={Megaphone} tone="success" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card title="My Complaints" action={<button className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/15">+ New</button>}>
              <ul className="divide-y divide-border">
                {[
                  { id: "#C-2041", title: "Lift not working in Block B", date: "2 days ago", tone: "warning" as const, status: "open" },
                  { id: "#C-2018", title: "AC drainage issue", date: "1 week ago", tone: "primary" as const, status: "in progress" },
                  { id: "#C-1996", title: "Intercom not working", date: "Resolved · Oct 22", tone: "success" as const, status: "resolved" },
                ].map((c) => (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-foreground/5">
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
            </Card>

            <Card title="Latest Notices">
              <ul className="space-y-3">
                {[
                  { t: "Diwali celebration in clubhouse", d: "Nov 12 · 7 PM · All blocks" },
                  { t: "Water tank cleaning scheduled", d: "Nov 14 · Block A & B" },
                  { t: "Updated visitor entry policy", d: "Effective Nov 1" },
                ].map((n) => (
                  <li key={n.t} className="flex items-start gap-3 p-3 rounded-xl hover:bg-foreground/5 transition">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[image:var(--gradient-primary)]" />
                    <div>
                      <div className="text-sm font-medium">{n.t}</div>
                      <div className="text-xs text-muted-foreground">{n.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Pre-approve Visitor">
              <div className="space-y-3">
                <input placeholder="Visitor name" className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <input placeholder="Phone number" className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <input type="datetime-local" className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                <button className="w-full h-10 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium hover:shadow-glow transition">Generate Pass</button>
              </div>
            </Card>

            <Card title="Payment History">
              <ul className="space-y-2.5">
                {[
                  { m: "October 2025", a: "₹ 4,250", s: "Paid" },
                  { m: "September 2025", a: "₹ 4,250", s: "Paid" },
                  { m: "August 2025", a: "₹ 4,250", s: "Paid" },
                ].map((p) => (
                  <li key={p.m} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{p.m}</div>
                      <div className="text-xs text-muted-foreground">{p.a}</div>
                    </div>
                    <Badge tone="success">{p.s}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
