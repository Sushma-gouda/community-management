import { createFileRoute } from "@tanstack/react-router";
import { Car, MapPin, Calendar, Shield, Zap } from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/resident/parking")({
  head: () => ({ meta: [{ title: "Parking — Communa" }] }),
  component: ResidentParking,
});

const vehicles = [
  {
    plate: "MH-12 AB-1234",
    model: "Honda City",
    type: "Car",
    color: "Pearl White",
    year: "2021",
    slot: "P-042",
    level: "Basement Level 1",
    zone: "Zone B",
    since: "Aug 2023",
  },
];

const parkingRules = [
  "Park only in your assigned slot.",
  "Visitor vehicles must be registered at the gate.",
  "No overnight parking for unregistered vehicles.",
  "EV charging slots are available on Level 2.",
  "Report any unauthorized vehicles to security.",
];

function ResidentParking() {
  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="My Parking" subtitle="Your assigned parking slot and vehicle details." />

        {/* Vehicle card */}
        {vehicles.map((v) => (
          <div key={v.plate} className="grid lg:grid-cols-3 gap-4">
            {/* Main vehicle card */}
            <div className="lg:col-span-2">
              <div
                className="relative overflow-hidden rounded-2xl shadow-elegant p-6 sm:p-8 text-white"
                style={{ background: "var(--gradient-hero)" }}
              >
                <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-white/70">Assigned Slot</div>
                      <div className="mt-1 text-5xl font-semibold tracking-tight">{v.slot}</div>
                      <div className="mt-2 text-white/80">{v.level} · {v.zone}</div>
                    </div>
                    <div className="grid place-items-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm">
                      <Car className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Vehicle plate */}
                  <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                    <div className="text-2xl font-bold tracking-widest">{v.plate}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Model", value: v.model },
                      { label: "Color", value: v.color },
                      { label: "Year", value: v.year },
                    ].map((d) => (
                      <div key={d.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                        <div className="text-xs text-white/70">{d.label}</div>
                        <div className="text-sm font-semibold mt-0.5">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: MapPin, label: "Parking Level", value: v.level },
                  { icon: MapPin, label: "Zone", value: v.zone },
                  { icon: Car, label: "Vehicle Type", value: v.type },
                  { icon: Calendar, label: "Assigned Since", value: v.since },
                  { icon: Shield, label: "Security", value: "CCTV Monitored" },
                  { icon: Zap, label: "EV Charging", value: "Available on Level 2" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-3 p-3 rounded-xl glass">
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
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Slot map preview */}
              <Card title="Slot Location">
                <div className="rounded-xl bg-foreground/[0.03] p-4">
                  <div className="text-xs text-muted-foreground mb-3">Basement Level 1 — Zone B</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const slotNum = i + 36;
                      const isYours = slotNum === 42;
                      const isOccupied = [37, 38, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53].includes(slotNum);
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-md grid place-items-center text-[10px] font-semibold transition ${
                            isYours
                              ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant"
                              : isOccupied
                              ? "bg-foreground/10 text-foreground/40"
                              : "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                          }`}
                        >
                          {slotNum}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[image:var(--gradient-primary)]" /> Your slot
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-foreground/10" /> Occupied
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--success)]/30" /> Free
                    </span>
                  </div>
                </div>
              </Card>

              {/* Parking rules */}
              <Card title="Parking Rules">
                <ul className="space-y-2">
                  {parkingRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/80">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 text-[10px] font-semibold">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
