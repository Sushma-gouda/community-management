import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchRecentVisitors,
  checkoutVisitor,
  type VisitorRow,
} from "@/services/supabase/community";
import {
  UserCheck,
  ShieldCheck,
  Car,
  AlertTriangle,
  LogIn,
  LogOut,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { securityNav } from "@/components/dashboard/securityNav";

export const Route = createFileRoute("/dashboard/security/")({
  head: () => ({ meta: [{ title: "Security Dashboard — Communa" }] }),
  component: SecurityDashboard,
});

function SecurityDashboard() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  const fetchLogs = async () => {
    const data = await fetchRecentVisitors(20);
    setVisitors(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCheckout = async (id: string) => {
    setLoadingCheckout(id);
    await checkoutVisitor(id);
    await fetchLogs();
    setLoadingCheckout(null);
  };

  const activeVisitors = visitors.filter((v) => !v.check_out);
  const todaysEntries = visitors.filter(
    (v) => new Date(v.check_in).toDateString() === new Date().toDateString(),
  ).length;

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
          <StatCard
            label="Visitors Inside"
            value={activeVisitors.length.toString()}
            icon={UserCheck}
            tone="primary"
          />
          <StatCard
            label="Today's Entries"
            value={todaysEntries.toString()}
            icon={ShieldCheck}
            tone="success"
          />
          <StatCard label="Vehicle Logs" value="—" icon={Car} tone="accent" />
          <StatCard label="Open Incidents" value="1" icon={AlertTriangle} tone="warning" />
        </div>

        {/* Active visitors */}
        <Card
          title={`Active Visitors (${activeVisitors.length})`}
          action={
            <Link
              to="/dashboard/security/active-visitors"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          }
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeVisitors.slice(0, 6).map((v) => (
              <div key={v.id} className="rounded-xl glass p-4 hover:shadow-card transition">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-[image:var(--gradient-primary)] text-white font-semibold text-sm shrink-0">
                    {v.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{v.name}</div>
                    <div className="text-[11px] text-muted-foreground">→ {v.flat_number}</div>
                  </div>
                  <Badge tone={v.purpose === "Guest" ? "primary" : "accent"}>{v.purpose}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <LogIn className="h-3 w-3" />{" "}
                    {new Date(v.check_in).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => void handleCheckout(v.id)}
                    disabled={loadingCheckout === v.id}
                    className="text-xs text-destructive hover:underline font-medium disabled:opacity-50"
                  >
                    {loadingCheckout === v.id ? "Checking out..." : "Check Out"}
                  </button>
                </div>
              </div>
            ))}
            {activeVisitors.length === 0 && (
              <div className="col-span-full py-6 text-center text-sm text-muted-foreground">
                No active visitors.
              </div>
            )}
          </div>
        </Card>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Live log */}
          <div className="lg:col-span-2">
            <Card
              title="Live Visitor Log"
              action={
                <Link
                  to="/dashboard/security/visitor-logs"
                  className="text-xs text-primary hover:underline"
                >
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
                    {visitors.slice(0, 10).map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-border last:border-0 hover:bg-foreground/[0.02]"
                      >
                        <td className="px-2 py-3 font-medium">{v.name}</td>
                        <td className="px-2 py-3">{v.flat_number}</td>
                        <td className="px-2 py-3 text-foreground/80">{v.purpose}</td>
                        <td className="px-2 py-3 text-foreground/80">
                          {new Date(v.check_in).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-2 py-3">
                          <Badge tone={v.check_out ? "muted" : "primary"}>
                            {v.check_out ? "Left" : "Inside"}
                          </Badge>
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
                <div className="text-xs text-muted-foreground mt-1.5">
                  Reported 12 min ago by R. Singh
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground font-medium">
                    Dispatch
                  </button>
                  <button className="text-xs px-3 py-1.5 rounded-md bg-foreground/5 hover:bg-foreground/10">
                    Resolve
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                No other incidents in the last 24h.
              </div>
            </Card>

            {/* Activity timeline */}
            <Card title="Today's Activity">
              {/* dynamic timeline not implemented */}
              <div className="text-sm text-muted-foreground p-2">
                Activity timeline will go here...
              </div>
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
