import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Phone, Building2, Clock, UserCheck, Search, X } from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { securityNav } from "@/components/dashboard/securityNav";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/security/active-visitors")({
  head: () => ({ meta: [{ title: "Active Visitors — Communa Security" }] }),
  component: ActiveVisitors,
});

type VisitorType = "Guest" | "Delivery" | "Service" | "Cab";
type Visitor = {
  id: string; name: string; phone: string; flat: string; host: string;
  purpose: VisitorType; checkIn: string; vehicle?: string; guard: string;
};

const seed: Visitor[] = [
  { id: "V-501", name: "Rohan Mehta", phone: "+91 99887 11223", flat: "A-204", host: "Priya Mehta", purpose: "Guest", checkIn: "10:42 AM", guard: "R. Singh" },
  { id: "V-499", name: "Plumber — Suresh", phone: "+91 99887 33445", flat: "C-101", host: "Sunil Joshi", purpose: "Service", checkIn: "10:21 AM", guard: "R. Singh" },
  { id: "V-497", name: "Ravi Kumar (Family)", phone: "+91 99887 55667", flat: "D-405", host: "Arjun Rao", purpose: "Guest", checkIn: "09:58 AM", guard: "M. Patil" },
  { id: "V-495", name: "Electrician — Ramesh", phone: "+91 99887 77889", flat: "B-302", host: "Anika Sharma", purpose: "Service", checkIn: "09:30 AM", vehicle: "MH-12 XY-1234", guard: "M. Patil" },
];

const purposeTone = (p: VisitorType) =>
  p === "Guest" ? "primary" : p === "Delivery" ? "warning" : p === "Service" ? "accent" : "success";

function ActiveVisitors() {
  const [visitors, setVisitors] = useState(seed);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const filtered = visitors.filter((v) =>
    !q ||
    v.name.toLowerCase().includes(q.toLowerCase()) ||
    v.flat.toLowerCase().includes(q.toLowerCase())
  );

  const handleCheckout = (id: string) => {
    setCheckingOut(id);
    setTimeout(() => {
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      setSelected(null);
      setCheckingOut(null);
    }, 800);
  };

  return (
    <DashboardLayout role="Security" items={securityNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Active Visitors"
          subtitle="Visitors currently inside the premises."
          actions={
            <Link
              to="/dashboard/security/add-visitor"
              className="inline-flex h-10 px-4 items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
            >
              + Add Visitor
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Currently Inside" value={String(visitors.length)} icon={UserCheck} tone="primary" />
          <StatCard label="Guests" value={String(visitors.filter((v) => v.purpose === "Guest").length)} icon={UserCheck} tone="accent" />
          <StatCard label="Service" value={String(visitors.filter((v) => v.purpose === "Service").length)} icon={UserCheck} tone="warning" />
          <StatCard label="Avg Stay" value="42m" icon={Clock} tone="success" />
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or flat…"
            className="w-full h-10 pl-9 pr-3 text-sm rounded-xl bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        {/* Visitor cards */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl glass shadow-card p-5 hover:shadow-elegant transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-11 w-11 rounded-full bg-[image:var(--gradient-primary)] text-white font-semibold shrink-0">
                      {v.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{v.name}</div>
                      <div className="text-[11px] text-muted-foreground">{v.id}</div>
                    </div>
                  </div>
                  <Badge tone={purposeTone(v.purpose)}>{v.purpose}</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span>→ {v.flat} · {v.host}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Checked in at {v.checkIn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{v.phone}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelected(v)}
                    className="flex-1 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-xs font-medium transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleCheckout(v.id)}
                    disabled={checkingOut === v.id}
                    className="flex-1 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {checkingOut === v.id ? "Checking out…" : "Check Out"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <div className="text-lg font-medium">No active visitors</div>
            <div className="text-sm mt-1">All visitors have checked out.</div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Visitor Details</h3>
              <button onClick={() => setSelected(null)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] text-white text-xl font-semibold mb-3">
                {selected.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="text-xl font-semibold">{selected.name}</div>
              <Badge tone={purposeTone(selected.purpose)}>{selected.purpose}</Badge>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: Phone, label: "Phone", value: selected.phone },
                { icon: Building2, label: "Visiting", value: `${selected.host} (${selected.flat})` },
                { icon: Clock, label: "Checked in", value: selected.checkIn },
                { icon: UserCheck, label: "Guard on duty", value: selected.guard },
                ...(selected.vehicle ? [{ icon: Building2, label: "Vehicle", value: selected.vehicle }] : []),
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03]">
                  <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary shrink-0">
                    <d.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-[11px] text-muted-foreground">{d.label}</div>
                    <div className="text-sm font-medium">{d.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 rounded-lg text-sm font-medium hover:bg-foreground/5">
                Close
              </button>
              <button
                onClick={() => handleCheckout(selected.id)}
                className="flex-1 h-10 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                <LogOut className="h-4 w-4" /> Mark Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
