import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard, ShieldCheck, Car, AlertTriangle, ClipboardList, UserCheck,
  LogIn, LogOut, Settings,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security Dashboard — Communa" }] }),
  component: SecurityDashboard,
});

const items = [
  { label: "Overview", to: "/dashboard/security", icon: LayoutDashboard },
  { label: "Visitor Entry", to: "/dashboard/security", icon: UserCheck },
  { label: "Vehicles", to: "/dashboard/security", icon: Car },
  { label: "Incidents", to: "/dashboard/security", icon: AlertTriangle },
  { label: "Patrol Log", to: "/dashboard/security", icon: ClipboardList },
  { label: "Settings", to: "/dashboard/security", icon: Settings },
];

const visitors = [
  { name: "Rohan Mehta", flat: "A-204", purpose: "Guest", time: "10:42 AM", status: "in", tone: "primary" as const },
  { name: "Swiggy", flat: "B-302", purpose: "Delivery", time: "10:36 AM", status: "out", tone: "muted" as const },
  { name: "Plumber", flat: "C-101", purpose: "Service", time: "10:21 AM", status: "in", tone: "primary" as const },
  { name: "Priya R.", flat: "D-409", purpose: "Guest", time: "09:58 AM", status: "out", tone: "muted" as const },
];

function SecurityDashboard() {
  return (
    <DashboardLayout role="Security" items={items}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Gate Operations</h1>
            <p className="text-sm text-muted-foreground mt-1">Shift: Morning · 06:00 – 14:00 · Gate 1</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 px-4 items-center rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm font-medium gap-2">
              <LogOut className="h-4 w-4" /> Check Out
            </button>
            <button className="inline-flex h-10 px-4 items-center rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant gap-2">
              <LogIn className="h-4 w-4" /> Check In
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Visitors Inside" value="14" icon={UserCheck} tone="primary" />
          <StatCard label="Today's Entries" value="47" icon={ShieldCheck} tone="success" />
          <StatCard label="Vehicle Logs" value="86" icon={Car} tone="accent" />
          <StatCard label="Open Incidents" value="1" icon={AlertTriangle} tone="warning" />
        </div>

        {/* Quick visitor entry */}
        <Card title="Quick Visitor Entry">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input placeholder="Visitor name" className="h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            <input placeholder="Phone" className="h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            <input placeholder="Flat (e.g. B-302)" className="h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            <select className="h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm">
              <option>Guest</option><option>Delivery</option><option>Service</option><option>Cab</option>
            </select>
            <button className="h-10 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium hover:shadow-glow transition">Send OTP</button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Live Visitor Log" action={<a className="text-xs text-primary hover:underline" href="#">Full log</a>}>
              <div className="overflow-x-auto -mx-1">
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
                    {visitors.map((v) => (
                      <tr key={v.name + v.time} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                        <td className="px-2 py-3 font-medium">{v.name}</td>
                        <td className="px-2 py-3">{v.flat}</td>
                        <td className="px-2 py-3 text-foreground/80">{v.purpose}</td>
                        <td className="px-2 py-3 text-foreground/80">{v.time}</td>
                        <td className="px-2 py-3"><Badge tone={v.tone}>{v.status === "in" ? "Inside" : "Left"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          <Card title="Active Incidents" action={<Badge tone="danger">1 open</Badge>}>
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                <AlertTriangle className="h-4 w-4" /> Suspicious vehicle at Gate 2
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">Reported 12 min ago by R. Singh</div>
              <div className="mt-3 flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-medium">Dispatch</button>
                <button className="text-xs px-3 py-1.5 rounded-md bg-foreground/5 hover:bg-foreground/10">Resolve</button>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">No other incidents in the last 24h.</div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
