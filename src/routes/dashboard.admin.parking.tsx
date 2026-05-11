import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Car, Bike, Truck } from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { FilterPill, PageHeader, PrimaryButton } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/parking")({
  head: () => ({ meta: [{ title: "Parking — Communa Admin" }] }),
  component: ParkingPage,
});

type Slot = { id: string; type: "Car" | "Bike" | "EV"; status: "Free" | "Occupied" | "Reserved"; flat?: string; vehicle?: string };

const slots: Slot[] = Array.from({ length: 40 }).map((_, i) => {
  const types: Slot["type"][] = ["Car", "Car", "Bike", "EV"];
  const t = types[i % 4];
  const r = i % 6;
  const status = r === 0 ? "Free" : r === 5 ? "Reserved" : "Occupied";
  return {
    id: `P-${String(i + 1).padStart(3, "0")}`,
    type: t,
    status,
    flat: status !== "Free" ? `${"ABCD"[i % 4]}-${100 + i}` : undefined,
    vehicle: status !== "Free" ? `MH-12 ${["AB", "CD", "EF", "GH"][i % 4]}-${1000 + i}` : undefined,
  };
});

const vehicles = [
  { plate: "MH-12 AB-1234", flat: "A-204", owner: "Priya Mehta", type: "Car", model: "Honda City" },
  { plate: "MH-12 CD-5678", flat: "B-302", owner: "Anika Sharma", type: "Car", model: "Hyundai Creta" },
  { plate: "MH-12 EF-9012", flat: "C-204", owner: "Meera Pillai", type: "EV", model: "Tata Nexon EV" },
  { plate: "MH-12 GH-3456", flat: "D-405", owner: "Arjun Rao", type: "Bike", model: "Royal Enfield" },
];

function ParkingPage() {
  const [filter, setFilter] = useState<"All" | Slot["status"]>("All");
  const display = slots.filter((s) => filter === "All" || s.status === filter);

  const stats = {
    total: slots.length,
    occupied: slots.filter(s => s.status === "Occupied").length,
    free: slots.filter(s => s.status === "Free").length,
    reserved: slots.filter(s => s.status === "Reserved").length,
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Parking" subtitle="Live slot occupancy and vehicle registry."
          actions={<PrimaryButton><Plus className="h-4 w-4" /> Register Vehicle</PrimaryButton>} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Slots" value={String(stats.total)} icon={Car} tone="primary" />
          <StatCard label="Occupied" value={String(stats.occupied)} icon={Car} tone="warning" />
          <StatCard label="Free" value={String(stats.free)} icon={Car} tone="success" />
          <StatCard label="Reserved" value={String(stats.reserved)} icon={Car} tone="accent" />
        </div>

        <Card title="Slot Map">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(["All", "Free", "Occupied", "Reserved"] as const).map((s) => (
              <FilterPill key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</FilterPill>
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {display.map((s) => {
              const cls = s.status === "Free"
                ? "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/30"
                : s.status === "Reserved"
                  ? "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/30"
                  : "bg-primary/10 text-primary border-primary/30";
              const Icon = s.type === "Bike" ? Bike : s.type === "EV" ? Truck : Car;
              return (
                <div key={s.id} title={`${s.id} · ${s.status}${s.flat ? " · " + s.flat : ""}`}
                  className={`aspect-square grid place-items-center rounded-xl border ${cls} text-center p-2 hover:scale-[1.04] transition cursor-pointer`}>
                  <Icon className="h-4 w-4" />
                  <div className="text-[10px] font-semibold mt-0.5">{s.id.replace("P-", "")}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Registered Vehicles">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vehicles.map((v) => {
              const Icon = v.type === "Bike" ? Bike : v.type === "EV" ? Truck : Car;
              return (
                <div key={v.plate} className="rounded-xl glass p-4 hover:shadow-card transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid place-items-center h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge tone="muted">{v.type}</Badge>
                  </div>
                  <div className="text-sm font-semibold tracking-wide">{v.plate}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{v.model}</div>
                  <div className="mt-3 text-xs text-foreground/80">{v.owner} · {v.flat}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
