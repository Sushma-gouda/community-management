import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wrench, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { PageHeader, PrimaryButton } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Communa Admin" }] }),
  component: MaintenancePage,
});

const assets = [
  { id: 1, name: "Lift A1", category: "Elevator", location: "Block A", lastService: "12 Apr", nextService: "12 Jul", health: 92, status: "Healthy" },
  { id: 2, name: "Lift B1", category: "Elevator", location: "Block B", lastService: "08 Mar", nextService: "08 Jun", health: 64, status: "Due Soon" },
  { id: 3, name: "Generator", category: "Power", location: "Basement", lastService: "20 Apr", nextService: "20 Oct", health: 88, status: "Healthy" },
  { id: 4, name: "Water Pump", category: "Plumbing", location: "Roof", lastService: "01 Feb", nextService: "01 May", health: 38, status: "Overdue" },
  { id: 5, name: "STP Plant", category: "Sanitation", location: "Backside", lastService: "15 Apr", nextService: "15 Jul", health: 78, status: "Healthy" },
  { id: 6, name: "CCTV Network", category: "Security", location: "Common", lastService: "30 Mar", nextService: "30 Jun", health: 70, status: "Due Soon" },
];

const schedule = [
  { date: "Tomorrow", time: "09:00", title: "Lift B1 quarterly service", vendor: "Otis Care", tone: "warning" as const },
  { date: "May 18", time: "10:30", title: "Water tank cleaning - all blocks", vendor: "Aquaclean", tone: "primary" as const },
  { date: "May 22", time: "14:00", title: "DG set load test", vendor: "PowerCo", tone: "primary" as const },
  { date: "May 30", time: "11:00", title: "Fire safety inspection", vendor: "FireGuard", tone: "accent" as const },
];

function MaintenancePage() {
  const tone = (s: string) => s === "Healthy" ? "success" : s === "Due Soon" ? "warning" : "danger";
  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Maintenance" subtitle="Track community assets and service schedules."
          actions={<PrimaryButton><Plus className="h-4 w-4" /> Schedule Service</PrimaryButton>} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Assets" value={String(assets.length)} icon={Wrench} tone="primary" />
          <StatCard label="Healthy" value={String(assets.filter(a => a.status === "Healthy").length)} icon={CheckCircle2} tone="success" />
          <StatCard label="Due Soon" value={String(assets.filter(a => a.status === "Due Soon").length)} icon={Calendar} tone="warning" />
          <StatCard label="Overdue" value={String(assets.filter(a => a.status === "Overdue").length)} icon={AlertCircle} tone="accent" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Assets">
              <div className="grid sm:grid-cols-2 gap-3">
                {assets.map((a) => (
                  <div key={a.id} className="rounded-xl glass p-4 hover:shadow-card transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="grid place-items-center h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] text-white"><Wrench className="h-4 w-4" /></div>
                        <div>
                          <div className="font-semibold">{a.name}</div>
                          <div className="text-[11px] text-muted-foreground">{a.category} · {a.location}</div>
                        </div>
                      </div>
                      <Badge tone={tone(a.status)}>{a.status}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Health</span>
                        <span className="font-semibold">{a.health}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${a.health}%`, background: a.health > 75 ? "oklch(from var(--success) l c h)" : a.health > 50 ? "oklch(from var(--warning) l c h)" : "oklch(from var(--destructive) l c h)" }} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Last: {a.lastService}</span>
                      <span>Next: <span className="font-medium text-foreground/80">{a.nextService}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Upcoming Schedule">
            <ol className="space-y-3">
              {schedule.map((s, i) => (
                <li key={i} className="rounded-xl bg-foreground/[0.03] p-3 hover:bg-foreground/[0.06] transition">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>{s.date} · {s.time}</span>
                    <Badge tone={s.tone}>scheduled</Badge>
                  </div>
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Vendor: {s.vendor}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
