import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchComplaintsForResident,
  fetchBillsForResident,
  fetchNotices,
  fetchParkingAll,
  insertVisitor,
  type ComplaintRow,
  type BillRow,
  type NoticeRow,
  type ParkingSlotRow,
} from "@/services/supabase/community";
import {
  Wallet,
  MessageSquareWarning,
  ShieldCheck,
  Megaphone,
  Car,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";

export const Route = createFileRoute("/dashboard/resident/")({
  head: () => ({ meta: [{ title: "My Dashboard — Communa" }] }),
  component: ResidentDashboard,
});

function ResidentDashboard() {
  const { profile, residentHome } = useAuth();

  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [bills, setBills] = useState<BillRow[]>([]);
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [parking, setParking] = useState<ParkingSlotRow | null>(null);

  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");

  useEffect(() => {
    if (residentHome?.resident.id) {
      fetchComplaintsForResident(residentHome.resident.id).then(setComplaints);
      fetchBillsForResident(residentHome.resident.id).then(setBills);
    }
    fetchNotices(3).then(setNotices);
    if (residentHome?.flat.id) {
      fetchParkingAll().then((all) => {
        const mySlot = all.find((p) => p.flat_id === residentHome.flat.id);
        if (mySlot) setParking(mySlot);
      });
    }
  }, [residentHome]);

  const handleVisitor = async () => {
    if (!visitorName) return;
    await insertVisitor({
      name: visitorName,
      phone: visitorPhone,
      flatNumber: residentHome?.flat.flat_number || "",
      purpose: "Guest",
      hostName: residentHome?.resident.name,
    });
    setVisitorName("");
    setVisitorPhone("");
    alert("Pass generated successfully");
  };

  const displayName = residentHome?.resident.name || profile?.full_name || "Resident";
  const flatDisplay = residentHome
    ? `Flat ${residentHome.flat.flat_number} · ${residentHome.block.name} · ${residentHome.resident.family_count} family members`
    : "No flat assigned";

  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const totalUnpaid = unpaidBills.reduce((acc, b) => acc + Number(b.amount), 0);
  const openComplaintsCount = complaints.filter(
    (c) => c.status === "open" || c.status === "in_progress",
  ).length;

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{flatDisplay}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard/resident/complaints"
              className="inline-flex h-10 px-4 items-center gap-2 rounded-lg glass text-sm font-medium hover:bg-foreground/5 transition"
            >
              <MessageSquareWarning className="h-4 w-4" /> Raise Complaint
            </Link>
          </div>
        </div>

        {/* Pending bill banner */}
        {unpaidBills.length > 0 && (
          <div
            className="relative overflow-hidden rounded-2xl shadow-elegant p-6 sm:p-8 text-white"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="absolute inset-0 opacity-30 mix-blend-overlay gradient-mesh" />
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">
                  {unpaidBills[0].label}
                </div>
                <div className="mt-1 text-4xl font-semibold tracking-tight">
                  ₹ {unpaidBills[0].amount}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-white/85">
                  <Clock className="h-4 w-4" /> Due:{" "}
                  {unpaidBills[0].due_date
                    ? new Date(unpaidBills[0].due_date).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <button className="inline-flex h-11 px-6 items-center rounded-xl glass-dark text-white font-medium hover:bg-white/15 transition">
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Bills"
            value={`₹${totalUnpaid}`}
            icon={Wallet}
            tone={totalUnpaid > 0 ? "warning" : "success"}
          />
          <StatCard
            label="Open Complaints"
            value={openComplaintsCount.toString()}
            icon={MessageSquareWarning}
            tone={openComplaintsCount > 0 ? "primary" : "success"}
          />
          <StatCard label="Expected Visitors" value="-" icon={ShieldCheck} tone="accent" />
          <StatCard
            label="Recent Notices"
            value={notices.length.toString()}
            icon={Megaphone}
            tone="success"
          />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Complaints */}
            <Card
              title="My Complaints"
              action={
                <Link
                  to="/dashboard/resident/complaints"
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/10 text-primary font-medium hover:bg-primary/15 transition"
                >
                  + New Complaint
                </Link>
              }
            >
              <ul className="divide-y divide-border">
                {complaints.slice(0, 3).map((c) => (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-foreground/5 shrink-0">
                      <MessageSquareWarning className="h-4 w-4 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      tone={
                        c.status === "resolved"
                          ? "success"
                          : c.status === "open"
                            ? "warning"
                            : "primary"
                      }
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
                {complaints.length === 0 && (
                  <li className="py-4 text-center text-sm text-muted-foreground">
                    No recent complaints.
                  </li>
                )}
              </ul>
              <Link
                to="/dashboard/resident/complaints"
                className="mt-3 block text-center text-xs text-primary hover:underline"
              >
                View all complaints →
              </Link>
            </Card>

            {/* Notices */}
            <Card
              title="Latest Notices"
              action={
                <Link
                  to="/dashboard/resident/notices"
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </Link>
              }
            >
              <ul className="space-y-2">
                {notices.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-foreground/5 transition"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-[image:var(--gradient-primary)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(n.published_at).toLocaleDateString()} ·{" "}
                        {n.target_block === "all" ? "All Blocks" : n.target_block}
                      </div>
                    </div>
                    {n.tag && <Badge tone={n.pinned ? "danger" : "primary"}>{n.tag}</Badge>}
                  </li>
                ))}
                {notices.length === 0 && (
                  <li className="p-4 text-center text-sm text-muted-foreground">
                    No recent notices.
                  </li>
                )}
              </ul>
            </Card>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Bills Paid",
                  value: "12/13",
                  icon: CheckCircle2,
                  color: "var(--success)",
                  pct: 92,
                },
                {
                  label: "Complaints Resolved",
                  value: "8/10",
                  icon: TrendingUp,
                  color: "var(--primary)",
                  pct: 80,
                },
                {
                  label: "Notices Read",
                  value: "18/23",
                  icon: AlertCircle,
                  color: "var(--warning)",
                  pct: 78,
                },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl glass shadow-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4" style={{ color: `oklch(from ${s.color} l c h)` }} />
                  </div>
                  <div className="text-lg font-semibold">{s.value}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.pct}%`, background: `oklch(from ${s.color} l c h)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Flat summary */}
            <Card title="My Flat">
              <div className="space-y-3">
                {[
                  { label: "Flat Number", value: residentHome?.flat.flat_number || "—" },
                  { label: "Block", value: residentHome?.block.name || "—" },
                  { label: "Floor", value: residentHome?.flat.floor?.toString() || "—" },
                  {
                    label: "Area",
                    value: residentHome?.flat.sqft ? `${residentHome.flat.sqft} sq ft` : "—",
                  },
                  {
                    label: "Family Members",
                    value: residentHome?.resident.family_count?.toString() || "—",
                  },
                  { label: "Status", value: residentHome?.resident.status || "—" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/resident/flat"
                className="mt-4 block text-center text-xs text-primary hover:underline"
              >
                View flat details →
              </Link>
            </Card>

            {/* Parking */}
            <Card title="My Parking">
              <div className="rounded-xl bg-[image:var(--gradient-primary)] p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Car className="h-6 w-6" />
                  <Badge tone="muted">{parking ? "Assigned" : "Unassigned"}</Badge>
                </div>
                {parking ? (
                  <>
                    <div className="text-2xl font-semibold">{parking.slot_number}</div>
                    <div className="text-sm text-white/80 mt-1">
                      {parking.level} {parking.zone ? `· Zone ${parking.zone}` : ""}
                    </div>
                    <div className="mt-3 text-xs text-white/70">{parking.type} Vehicle</div>
                  </>
                ) : (
                  <div className="text-sm text-white/80 mt-1">No parking slot assigned</div>
                )}
              </div>
              <Link
                to="/dashboard/resident/parking"
                className="mt-3 block text-center text-xs text-primary hover:underline"
              >
                View parking details →
              </Link>
            </Card>

            {/* Payment history */}
            <Card
              title="Payment History"
              action={
                <Link
                  to="/dashboard/resident/billing"
                  className="text-xs text-primary hover:underline"
                >
                  All bills
                </Link>
              }
            >
              <ul className="space-y-2.5">
                {bills.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{p.label}</div>
                      <div className="text-xs text-muted-foreground">₹{p.amount}</div>
                    </div>
                    <Badge tone={p.status === "paid" ? "success" : "warning"}>{p.status}</Badge>
                  </li>
                ))}
                {bills.length === 0 && (
                  <li className="text-sm text-muted-foreground">No bills found.</li>
                )}
              </ul>
            </Card>

            {/* Pre-approve visitor */}
            <Card title="Pre-approve Visitor">
              <div className="space-y-2.5">
                <input
                  placeholder="Visitor name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <input
                  placeholder="Phone number"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <button
                  onClick={() => void handleVisitor()}
                  className="w-full h-10 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium hover:shadow-glow transition"
                >
                  Generate Pass
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

