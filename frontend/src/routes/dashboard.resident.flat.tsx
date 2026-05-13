import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Layers,
  Maximize2,
  Calendar,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  Shield,
} from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/resident/flat")({
  head: () => ({ meta: [{ title: "My Flat — Communa" }] }),
  component: ResidentFlat,
});

const amenities = [
  { icon: Wifi, label: "High-Speed WiFi", desc: "1 Gbps fiber in common areas" },
  { icon: Dumbbell, label: "Gym", desc: "Open 6 AM – 10 PM" },
  { icon: Waves, label: "Swimming Pool", desc: "Open 7 AM – 8 PM" },
  { icon: Car, label: "Parking", desc: "Covered basement parking" },
  { icon: Shield, label: "24/7 Security", desc: "CCTV + security guards" },
  { icon: Layers, label: "Lift", desc: "2 lifts per block" },
];

const familyMembers = [
  { name: "Anika Sharma", relation: "Self", age: "32" },
  { name: "Rahul Sharma", relation: "Spouse", age: "35" },
  { name: "Arya Sharma", relation: "Daughter", age: "8" },
  { name: "Rohan Sharma", relation: "Son", age: "5" },
];

function ResidentFlat() {
  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="My Flat" subtitle="Details about your flat and community amenities." />

        {/* Hero flat card */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-elegant p-6 sm:p-8 text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Your Flat</div>
                <div className="mt-1 text-5xl font-semibold tracking-tight">B-302</div>
                <div className="mt-2 text-white/80">Block B · 3rd Floor · Communa Heights</div>
              </div>
              <div className="grid place-items-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Area", value: "1,620 sqft" },
                { label: "Bedrooms", value: "3 BHK" },
                { label: "Floor", value: "3rd" },
                { label: "Facing", value: "East" },
              ].map((d) => (
                <div key={d.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-3">
                  <div className="text-xs text-white/70">{d.label}</div>
                  <div className="text-lg font-semibold mt-0.5">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Flat details */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Flat Information">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "Flat Number", value: "B-302" },
                  { icon: Layers, label: "Block", value: "Block B" },
                  { icon: Layers, label: "Floor", value: "3rd Floor" },
                  { icon: Maximize2, label: "Area", value: "1,620 sq ft" },
                  { icon: Building2, label: "Type", value: "3 BHK" },
                  { icon: Building2, label: "Facing", value: "East" },
                  { icon: Calendar, label: "Possession Date", value: "Aug 15, 2023" },
                  { icon: Users, label: "Occupancy", value: "4 Members" },
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
            </Card>

            {/* Amenities */}
            <Card title="Community Amenities">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a.label}
                    className="rounded-xl glass p-4 hover:shadow-card transition flex items-start gap-3"
                  >
                    <div className="grid place-items-center h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] text-white shrink-0">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{a.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Family members */}
          <div className="space-y-4">
            <Card
              title="Family Members"
              action={
                <span className="text-xs text-muted-foreground">
                  {familyMembers.length} members
                </span>
              }
            >
              <div className="space-y-2">
                {familyMembers.map((m) => {
                  const initials = m.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("");
                  return (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition"
                    >
                      <div className="h-10 w-10 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-white text-sm font-semibold shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.relation} · Age {m.age}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Maintenance info */}
            <Card title="Maintenance Info">
              <div className="space-y-3">
                {[
                  { label: "Monthly Charge", value: "₹4,500" },
                  { label: "Due Date", value: "30th of every month" },
                  { label: "Payment Mode", value: "UPI / Net Banking" },
                  { label: "Last Paid", value: "April 30, 2026" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.value}</span>
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
