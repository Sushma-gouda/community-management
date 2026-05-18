import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Search, LogIn, LogOut, Phone, Car, Building2, X, Filter } from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { securityNav } from "@/components/dashboard/securityNav";
import { FilterPill, PageHeader } from "@/components/dashboard/PageHeader";
import { fetchVisitorsDetailed, type VisitorDetailed } from "@/services/supabase/community";
import { supabase } from "@/services/supabase/client";

export const Route = createFileRoute("/dashboard/security/visitor-logs")({
  head: () => ({ meta: [{ title: "Visitor Logs — Communa Security" }] }),
  component: VisitorLogs,
});

type VisitorType = "Guest" | "Delivery" | "Service" | "Cab";

const purposeTone = (p: VisitorType) =>
  p === "Guest" ? "primary" : p === "Delivery" ? "warning" : p === "Service" ? "accent" : "success";

function VisitorLogs() {
  const [allLogs, setAllLogs] = useState<VisitorDetailed[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | VisitorType>("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [flatFilter, setFlatFilter] = useState("");
  const [selected, setSelected] = useState<VisitorDetailed | null>(null);

  const loadLogs = () => {
    fetchVisitorsDetailed().then(setAllLogs);
  };

  useEffect(() => {
    loadLogs();

    const channel = supabase
      .channel("visitor_logs_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, () => {
        loadLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dates = useMemo(() => ["All", ...Array.from(new Set(allLogs.map((l) => l.date)))], [allLogs]);

  const filtered = useMemo(
    () =>
      allLogs.filter((l) => {
        const matchQ =
          !q ||
          l.name.toLowerCase().includes(q.toLowerCase()) ||
          l.flat.toLowerCase().includes(q.toLowerCase()) ||
          l.host.toLowerCase().includes(q.toLowerCase());
        const matchType = typeFilter === "All" || l.purpose === typeFilter;
        const matchDate = dateFilter === "All" || l.date === dateFilter;
        const matchFlat = !flatFilter || l.flat.toLowerCase().includes(flatFilter.toLowerCase());
        return matchQ && matchType && matchDate && matchFlat;
      }),
    [allLogs, q, typeFilter, dateFilter, flatFilter],
  );

  const inside = allLogs.filter((l) => !l.checkOut).length;

  return (
    <DashboardLayout role="Security" items={securityNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Visitor Logs"
          subtitle="Complete searchable history of all visitor entries."
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Entries"
            value={String(allLogs.length)}
            icon={LogIn}
            tone="primary"
          />
          <StatCard label="Currently Inside" value={String(inside)} icon={LogIn} tone="success" />
          <StatCard
            label="Checked Out"
            value={String(allLogs.length - inside)}
            icon={LogOut}
            tone="accent"
          />
          <StatCard
            label="Deliveries"
            value={String(allLogs.filter((l) => l.purpose === "Delivery").length)}
            icon={Car}
            tone="warning"
          />
        </div>

        {/* Filters */}
        <Card title="Search & Filter">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, flat, host…"
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={flatFilter}
                  onChange={(e) => setFlatFilter(e.target.value)}
                  placeholder="Filter by flat (e.g. A-204)"
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
              >
                {dates.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(["All", "Guest", "Delivery", "Service", "Cab"] as const).map((t) => (
                <FilterPill key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
                  {t}
                </FilterPill>
              ))}
            </div>
          </div>
        </Card>

        {/* Log table */}
        <Card title={`${filtered.length} entries`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-medium">ID</th>
                  <th className="px-2 py-2 font-medium">Visitor</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Flat</th>
                  <th className="px-2 py-2 font-medium">Host</th>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">In</th>
                  <th className="px-2 py-2 font-medium">Out</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="border-b border-border last:border-0 hover:bg-foreground/[0.03] cursor-pointer"
                  >
                    <td className="px-2 py-3 font-medium text-muted-foreground">{l.id}</td>
                    <td className="px-2 py-3 font-medium">{l.name}</td>
                    <td className="px-2 py-3">
                      <Badge tone={purposeTone(l.purpose)}>{l.purpose}</Badge>
                    </td>
                    <td className="px-2 py-3">{l.flat}</td>
                    <td className="px-2 py-3 text-foreground/80">{l.host}</td>
                    <td className="px-2 py-3 text-foreground/70">{l.date}</td>
                    <td className="px-2 py-3 text-foreground/80">{l.checkIn}</td>
                    <td className="px-2 py-3">
                      {l.checkOut ? (
                        <span className="text-foreground/80">{l.checkOut}</span>
                      ) : (
                        <span className="text-[color:var(--success)] font-medium">Inside</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      No entries match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Visitor Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-[image:var(--gradient-primary)] text-white text-xl font-semibold mb-3">
                {selected.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="text-xl font-semibold">{selected.name}</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge tone={purposeTone(selected.purpose)}>{selected.purpose}</Badge>
                {selected.checkOut ? (
                  <Badge tone="muted">Left</Badge>
                ) : (
                  <Badge tone="success">Inside</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: Phone, label: "Phone", value: selected.phone },
                {
                  icon: Building2,
                  label: "Visiting",
                  value: `${selected.host} (${selected.flat})`,
                },
                {
                  icon: LogIn,
                  label: "Checked in",
                  value: `${selected.date} · ${selected.checkIn}`,
                },
                ...(selected.checkOut
                  ? [{ icon: LogOut, label: "Checked out", value: selected.checkOut }]
                  : []),
                ...(selected.vehicle
                  ? [{ icon: Car, label: "Vehicle", value: selected.vehicle }]
                  : []),
                { icon: Building2, label: "Guard on duty", value: selected.guard },
              ].map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03]"
                >
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="h-10 px-4 rounded-lg text-sm font-medium hover:bg-foreground/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
