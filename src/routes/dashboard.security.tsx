import { createFileRoute, Link } from "@tanstack/react-router";
import {
  UserCheck, ShieldCheck, Car, AlertTriangle, LogIn, LogOut, Clock, TrendingUp,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { securityNav } from "@/components/dashboard/securityNav";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security Dashboard — Communa" }] }),
  component: SecurityDashboard,
});

const activeVisitors = [
  { name: "Rohan Mehta", flat: "A-204", purpose: "Guest", time: "10:42 AM", initials: "RM", tone: "primary" as const },
  { name: "Plumber — Suresh", flat: "C-101", purpose: "Service", time: "10:21 AM", initials: "PS", tone: "accent" as const },
  { name: "Ravi Kumar (Family)", flat: "D-405", purpose: "Guest", time: "09:58 AM", initials: "RK", tone: "primary" as const },
];

const recentLog = [
  { name: "Rohan Mehta", flat: "A-204", purpose: "Guest", time: "10:42 AM", status: "in", tone: "primary" as const },
  { name: "Swiggy Delivery", flat: "B-302", purpose: "Delivery", time: "10:36 AM", status: "out", tone: "muted" as const },
  { name: "Plumber — Suresh", flat: "C-101", purpose: "Service", time: "10:21 AM", status: "in", tone: "primary" as const },
  { name: "Priya R. (Guest)", flat: "D-409", purpose: "Guest", time: "09:58 AM", status: "out", tone: "muted" as const },
  { name: "Amazon Delivery", flat: "A-101", purpose: "Delivery", time: "09:30 AM", status: "out", tone: "muted" as const },
];

const timeline = [
  { time: "10:42 AM", title: "Visitor checked in", desc: "Rohan Mehta → A-204", tone: "primary" as const },
  { time: "10:36 AM", title: "Delivery checked out", desc: "Swiggy → B-302", tone: "muted" as const },
  { time: "10:21 AM", title: "Service entry", desc: "Plumber → C-101", tone: "accent" as const },
  { time: "09:30 AM", title: "Shift started", desc: "Gate 1 · Morning shift", tone: "success" as const },
];

function SecurityDashboard() {
  return (
    <DashboardLayout role="Security" items={securityNav}>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Gate Operations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Shift: Morning · 06:00 – 14:00 · Gate 1
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 px-4 items-center rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm font-medium gap-2 transition">
              <LogOut className="h-4 w-4" /> Check Out
            </button>
            <Link
              to="/dashboard/security/add-visitor"
              className="inline-flex h-10 px-4 items-center rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant gap-2 hover:shadow-glow transition"
            >
              <LogIn className="h-4 w-4" /> Add Visitor
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Visitors Inside" value="14" icon={UserCheck} tone="primary" />
          <StatCard label="Today's Entries" value="47" icon={ShieldCheck} tone="success" />
          <StatCard label="Vehicle Logs" value="86" icon={Car} tone="accent" />
          <StatCard label="Open Incidents" value="1" icon={AlertTriangle} tone="warning" />
        </div>

        {/* Active visitors */}
        <Card
          title={`Active Visitors (${activeVisitors.length})`}
          action={
            <Link to="/dashboard/security/active-visitors" className="text-xs text-primary hover:underline">
              View all
            </Link>
          }
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeVisitors.map((v) => (
              <div key={v.name} className="rounded-xl glass p-4 hover:shadow-card transition">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-[image:var(--gradient-primary)] text-white font-semibold text-sm shrink-0">
                    {v.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{v.name}</div>
                    <div className="text-[11px] text-muted-foreground">→ {v.flat}</div>
                  </div>
                  <Badge tone={v.tone}>{v.purpose}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <LogIn className="h-3 w-3" /> {v.time}
                  </span>
                  <button className="text-xs text-destructive hover:underline font-medium">Check Out</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Live log */}
          <div className="lg:col-span-2">
            <Card
              title="Live Visitor Log"
              action={
                <Link to="/dashboard/security/visitor-logs" className="text-xs text-primary hover:underline">
                  Full log
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="px-2 py-2 font-medium">Visitor</th>
                      <th className="px-2 py-2 font-medium">Flat</th>
                      <th className="px-2 py-2 font-medium">Purpose</th>
                      <th className="px-2 py-2 font-medium">Time</th>
                      <th className="px-2 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLog.map((v) => (
                      <tr key={v.name + v.time} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                        <td className="px-2 py-3 font-medium">{v.name}</td>
                        <td className="px-2 py-3">{v.flat}</td>
                        <td className="px-2 py-3 text-foreground/80">{v.purpose}</td>
                        <td className="px-2 py-3 text-foreground/80">{v.time}</td>
                        <td className="px-2 py-3">
                          <Badge tone={v.tone}>{v.status === "in" ? "Inside" : "Left"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Incident */}
            <Card title="Active Incidents" action={<Badge tone="danger">1 open</Badge>}>
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                  <AlertTriangle className="h-4 w-4" /> Suspicious vehicle at Gate 2
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">Reported 12 min ago by R. Singh</div>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-medium">
                    Dispatch
                  </button>
                  <button className="text-xs px-3 py-1.5 rounded-md bg-foreground/5 hover:bg-foreground/10">
                    Resolve
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">No other incidents in the last 24h.</div>
            </Card>

            {/* Activity timeline */}
            <Card title="Today's Activity">
              <ol className="relative space-y-4 ml-2">
                {timeline.map((t, i) => (
                  <li key={i} className="pl-5 relative">
                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[image:var(--gradient-primary)] shadow-glow" />
                    {i !== timeline.length - 1 && (
                      <span className="absolute left-[4px] top-4 bottom-[-1rem] w-px bg-border" />
                    )}
                    <div className="text-[11px] text-muted-foreground">{t.time}</div>
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </li>
                ))}
              </ol>
            </Card>

            {/* Quick stats */}
            <Card title="Shift Stats">
              <div className="space-y-3">
                {[
                  { label: "Guests", value: 58, color: "var(--primary)" },
                  { label: "Deliveries", value: 24, color: "var(--accent)" },
                  { label: "Service", value: 12, color: "var(--warning)" },
                  { label: "Cabs", value: 6, color: "var(--success)" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-semibold">{s.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.value}%`, background: `oklch(from ${s.color} l c h)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
