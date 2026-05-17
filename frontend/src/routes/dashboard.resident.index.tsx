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
    if (!visitorName || !residentHome?.flat.id) return;
    const { error } = await insertVisitor({
      name: visitorName,
      phone: visitorPhone,
      flat_id: residentHome.flat.id,
      purpose: "Guest",
    });
    if (error) {
      alert("Error generating pass: " + error);
    } else {
      setVisitorName("");
      setVisitorPhone("");
      alert("Pass generated successfully");
    }
  };

  const displayName = residentHome?.resident.full_name || profile?.full_name || "Resident";
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
              <MessageSquareWarning className="h-4 w-4" /> Help
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Outstanding"
            value={`₹${totalUnpaid.toLocaleString()}`}
            subText={unpaidBills.length > 0 ? `${unpaidBills.length} bill(s) due` : "All paid"}
            icon={Wallet}
            tone={totalUnpaid > 0 ? "warning" : "success"}
          />
          <StatCard
            label="Complaints"
            value={openComplaintsCount.toString()}
            subText={openComplaintsCount > 0 ? "Action required" : "No open issues"}
            icon={MessageSquareWarning}
            tone={openComplaintsCount > 0 ? "danger" : "muted"}
          />
          <StatCard
            label="Parking"
            value={parking ? parking.slot_number : "None"}
            subText={parking ? `Level ${parking.level || "—"}` : "Unassigned"}
            icon={Car}
            tone="primary"
          />
          <StatCard
            label="Trust Score"
            value="98"
            subText="Top 5% resident"
            icon={ShieldCheck}
            tone="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Notices */}
            <Card
              title="Recent Notices"
              icon={Megaphone}
              action={
                <Link to="/dashboard/resident/" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              }
            >
              <div className="space-y-4">
                {notices.map((n) => (
                  <div key={n.id} className="group cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium group-hover:text-primary transition">
                            {n.title}
                          </h4>
                          {n.pinned && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{n.body}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          {new Date(n.published_at).toLocaleDateString()}
                          <span>·</span>
                          <span className="capitalize">{n.tag || "General"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {notices.length === 0 && (
                  <div className="py-10 text-center text-muted-foreground">No recent notices.</div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card title="Quick Pass" icon={ShieldCheck}>
                <p className="text-xs text-muted-foreground mb-4">
                  Generate a temporary entry pass for your guests.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-foreground/[0.03] border border-border text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Guest Phone"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-foreground/[0.03] border border-border text-sm"
                  />
                  <button
                    onClick={handleVisitor}
                    className="w-full h-9 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
                  >
                    Generate Pass
                  </button>
                </div>
              </Card>

              <Card title="Maintenance" icon={Building2}>
                <p className="text-xs text-muted-foreground mb-4">
                  Report a new issue or track your existing requests.
                </p>
                <div className="space-y-2">
                  <Link
                    to="/dashboard/resident/complaints"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-foreground/[0.03] transition group"
                  >
                    <span className="text-sm">Raise Complaint</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between p-2 text-muted-foreground/50">
                    <span className="text-sm">Request Service</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Soon</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bills Sidebar */}
            <Card title="Pending Payments" icon={Wallet}>
              <div className="space-y-4">
                {unpaidBills.slice(0, 3).map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{b.label}</div>
                      <div className="text-[10px] text-muted-foreground">Due: {new Date(b.due_date!).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">₹{Number(b.amount).toLocaleString()}</div>
                      <Link to="/dashboard/resident/billing" className="text-[10px] text-primary hover:underline">Pay</Link>
                    </div>
                  </div>
                ))}
                {unpaidBills.length === 0 && (
                  <div className="py-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2 opacity-20" />
                    <p className="text-xs text-muted-foreground">No pending bills</p>
                  </div>
                )}
                <div className="pt-2 border-t border-border">
                  <Link to="/dashboard/resident/billing" className="text-xs text-center block w-full text-primary font-medium hover:underline">
                    View Billing History
                  </Link>
                </div>
              </div>
            </Card>

            {/* Status Tracking */}
            <Card title="Active Requests" icon={Clock}>
              <div className="space-y-4">
                {complaints
                  .filter((c) => c.status !== "resolved")
                  .slice(0, 3)
                  .map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-warning shrink-0" />
                      <div>
                        <div className="text-sm font-medium line-clamp-1">{c.title}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {c.status.replace("_", " ")} · {c.category}
                        </div>
                      </div>
                    </div>
                  ))}
                {complaints.filter((c) => c.status !== "resolved").length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No active requests</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
