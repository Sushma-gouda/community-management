import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Car, MapPin, Calendar, Shield, Zap, AlertCircle } from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { supabase } from "@/services/supabase/client";
import {
  fetchResidentParking,
  fetchParkingAll,
  type ParkingDetailed,
} from "@/services/supabase/community";

export const Route = createFileRoute("/dashboard/resident/parking")({
  head: () => ({ meta: [{ title: "Parking — Communa" }] }),
  component: ResidentParking,
});

const parkingRules = [
  "Park only in your assigned slot.",
  "Visitor vehicles must be registered at the gate.",
  "No overnight parking for unregistered vehicles.",
  "EV charging slots are available on Level 2.",
  "Report any unauthorized vehicles to security.",
];

function ResidentParking() {
  const [vehicles, setVehicles] = useState<ParkingDetailed[]>([]);
  const [allParking, setAllParking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParkingData = async () => {
    setLoading(true);
    try {
      const [myParking, allSlots] = await Promise.all([
        fetchResidentParking(),
        fetchParkingAll(),
      ]);
      setVehicles(myParking);
      setAllParking(allSlots);
    } catch (e) {
      console.error("Failed to load resident parking data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParkingData();

    // Set up real-time subscription for instant sync
    const channel = supabase
      .channel("parking-resident-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parking" },
        () => {
          loadParkingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSlotDetails = (slot: string) => {
    const num = parseInt(slot.replace("P-", ""), 10) || 0;
    if (num <= 15) {
      return { level: "Basement Level 1", zone: "Zone A" };
    } else if (num <= 30) {
      return { level: "Basement Level 1", zone: "Zone B" };
    } else {
      return { level: "Basement Level 2", zone: "Zone C" };
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="Resident" items={residentNav}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (vehicles.length === 0) {
    return (
      <DashboardLayout role="Resident" items={residentNav}>
        <div className="space-y-6 animate-fade-up">
          <PageHeader title="My Parking" subtitle="Your assigned parking slot and vehicle details." />
          <div className="rounded-2xl glass p-8 text-center max-w-xl mx-auto border border-border/50 shadow-elegant">
            <Car className="h-12 w-12 text-primary mx-auto mb-4 opacity-70" />
            <h3 className="text-lg font-semibold mb-2">No Parking Slot Assigned</h3>
            <p className="text-sm text-muted-foreground mb-4">
              It looks like you do not have an active parking slot assigned to your flat yet. Please contact the building administration to register your vehicle and assign a slot.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="My Parking" subtitle="Your assigned parking slot and vehicle details." />

        {vehicles.map((v) => {
          const details = getSlotDetails(v.slot_number);
          const sinceDate = v.allocated_at
            ? new Date(v.allocated_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "N/A";

          // Center the mini map grid of 20 slots around the resident's actual slot number
          const slotNumVal = parseInt(v.slot_number.replace("P-", ""), 10) || 1;
          const startNum = Math.max(1, Math.min(21, slotNumVal - 9));
          const slotArray = Array.from({ length: 20 }).map((_, i) => startNum + i);

          return (
            <div key={v.id} className="grid lg:grid-cols-3 gap-4">
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
                        <div className="text-xs uppercase tracking-widest text-white/70">
                          Assigned Slot
                        </div>
                        <div className="mt-1 text-5xl font-semibold tracking-tight">{v.slot_number}</div>
                        <div className="mt-2 text-white/80">
                          {details.level} · {details.zone}
                        </div>
                      </div>
                      <div className="grid place-items-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm">
                        <Car className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Vehicle plate */}
                    <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3">
                      <div className="text-2xl font-bold tracking-widest">{v.plate_number}</div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "Model", value: v.vehicle_model || "—" },
                        { label: "Type", value: v.vehicle_type },
                        { label: "Status", value: "Active" },
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
                    { icon: MapPin, label: "Parking Level", value: details.level },
                    { icon: MapPin, label: "Zone", value: details.zone },
                    { icon: Car, label: "Vehicle Type", value: v.vehicle_type },
                    { icon: Calendar, label: "Assigned Since", value: sinceDate },
                    { icon: Shield, label: "Security", value: "CCTV Monitored" },
                    { icon: Zap, label: "EV Charging", value: v.vehicle_type === "EV" ? "Available at your slot" : "Available on Level 2" },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-3 p-3 rounded-xl glass border border-border/50">
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
                  <div className="rounded-xl bg-foreground/[0.03] p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-3">
                      {details.level} — {details.zone}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {slotArray.map((slotNum) => {
                        const slotId = `P-${String(slotNum).padStart(3, "0")}`;
                        const isYours = slotId === v.slot_number;
                        const isOccupied = allParking.some((p) => p.slot_number === slotId);
                        return (
                          <div
                            key={slotNum}
                            className={`aspect-square rounded-md grid place-items-center text-[10px] font-semibold transition ${
                              isYours
                                ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant"
                                : isOccupied
                                  ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                                  : "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                            }`}
                          >
                            {slotNum}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-[image:var(--gradient-primary)]" />{" "}
                        Your slot
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-[color:var(--warning)]/30" /> Occupied
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
          );
        })}
      </div>
    </DashboardLayout>
  );
}
