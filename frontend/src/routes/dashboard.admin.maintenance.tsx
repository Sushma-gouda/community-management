import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Plus, Wrench, Calendar, CheckCircle2, AlertCircle, Search, Pencil, Trash2, Loader2, DollarSign, Phone, User, X } from "lucide-react";
import { Badge, Card, DashboardLayout, StatCard } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { PageHeader, PrimaryButton } from "@/components/dashboard/PageHeader";
import { supabase } from "@/services/supabase/client";
import {
  fetchMaintenanceAll,
  insertMaintenanceEntry,
  updateMaintenanceEntry,
  deleteMaintenanceEntry,
  type MaintenanceRow,
} from "@/services/supabase/community";

export const Route = createFileRoute("/dashboard/admin/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — Communa Admin" }] }),
  component: MaintenancePage,
});

function getAssetCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("lift") || n.includes("elevator")) return "Elevator";
  if (n.includes("generator") || n.includes("dg") || n.includes("power")) return "Power";
  if (n.includes("pump") || n.includes("water") || n.includes("plumbing")) return "Plumbing";
  if (n.includes("stp") || n.includes("sewage") || n.includes("sanitation")) return "Sanitation";
  if (n.includes("cctv") || n.includes("camera") || n.includes("security") || n.includes("fire")) return "Security";
  return "Utility";
}

function getAssetHealth(status: string): number {
  if (status === "Healthy") return 92;
  if (status === "Due Soon") return 64;
  return 38; // Overdue
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function MaintenancePage() {
  const [data, setData] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Healthy" | "Due Soon" | "Overdue">("All");

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MaintenanceRow | null>(null);

  // Form Fields
  const [assetName, setAssetName] = useState("");
  const [location, setLocation] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [cost, setCost] = useState("0");
  const [vendorName, setVendorName] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [status, setStatus] = useState<"Healthy" | "Due Soon" | "Overdue">("Healthy");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load all maintenance records from Supabase
  const loadData = async () => {
    try {
      const allMaintenance = await fetchMaintenanceAll();
      setData(allMaintenance);
    } catch (e) {
      console.error("Failed to load maintenance records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscription for instant synchronization
    const channel = supabase
      .channel("maintenance-admin-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance" },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenNew = () => {
    setSelectedAsset(null);
    setAssetName("");
    setLocation("");
    setLastServiceDate("");
    setNextDueDate("");
    setCost("0");
    setVendorName("");
    setVendorContact("");
    setStatus("Healthy");
    setErrorMsg(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (a: MaintenanceRow) => {
    setSelectedAsset(a);
    setAssetName(a.asset_name);
    setLocation(a.location);
    setLastServiceDate(toInputDate(a.last_service_date));
    setNextDueDate(toInputDate(a.next_due_date));
    setCost(String(a.cost));
    setVendorName(a.vendor_name || "");
    setVendorContact(a.vendor_contact || "");
    setStatus(a.status as any);
    setErrorMsg(null);
    setOpenModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !location.trim()) {
      setErrorMsg("Asset Name and Location are required.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      asset_name: assetName.trim(),
      location: location.trim(),
      last_service_date: lastServiceDate ? new Date(lastServiceDate).toISOString() : null,
      next_due_date: nextDueDate ? new Date(nextDueDate).toISOString() : null,
      cost: Number(cost) || 0,
      vendor_name: vendorName.trim(),
      vendor_contact: vendorContact.trim(),
      status,
    };

    try {
      if (selectedAsset) {
        const { error } = await updateMaintenanceEntry(selectedAsset.id, payload);
        if (error) throw new Error(error);
      } else {
        const { error } = await insertMaintenanceEntry(payload);
        if (error) throw new Error(error);
      }
      setOpenModal(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;

    setSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await deleteMaintenanceEntry(selectedAsset.id);
      if (error) throw new Error(error);
      setOpenModal(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to delete record.");
    } finally {
      setSaving(false);
    }
  };

  // Compute stat counters
  const stats = useMemo(() => {
    return {
      total: data.length,
      healthy: data.filter((a) => a.status === "Healthy").length,
      dueSoon: data.filter((a) => a.status === "Due Soon").length,
      overdue: data.filter((a) => a.status === "Overdue").length,
    };
  }, [data]);

  // Dynamic filter and search query matching
  const filteredAssets = useMemo(() => {
    return data.filter((a) => {
      const matchesFilter = filter === "All" || a.status === filter;
      if (!matchesFilter) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        a.asset_name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.vendor_name && a.vendor_name.toLowerCase().includes(q)) ||
        a.status.toLowerCase().includes(q)
      );
    });
  }, [data, searchQuery, filter]);

  // Compute intelligent upcoming schedule lists
  const upcomingSchedule = useMemo(() => {
    return data
      .filter((a) => a.next_due_date)
      .map((a) => {
        const nextDate = new Date(a.next_due_date!);
        let dateLabel = "N/A";
        if (!isNaN(nextDate.getTime())) {
          const diffTime = nextDate.getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 0) dateLabel = "Today";
          else if (diffDays === 1) dateLabel = "Tomorrow";
          else if (diffDays === -1) dateLabel = "Yesterday";
          else if (diffDays > 1 && diffDays < 7) {
            dateLabel = nextDate.toLocaleDateString("en-US", { weekday: "long" });
          } else {
            dateLabel = nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
        }

        return {
          date: dateLabel,
          time: "10:00",
          title: `${a.asset_name} scheduled service`,
          vendor: a.vendor_name || "—",
          tone: (a.status === "Overdue" ? "danger" : a.status === "Due Soon" ? "warning" : "primary") as any,
        };
      })
      .slice(0, 5);
  }, [data]);

  const tone = (s: string) =>
    s === "Healthy" ? "success" : s === "Due Soon" ? "warning" : "danger";

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Maintenance"
          subtitle="Track community assets and service schedules."
          actions={
            <PrimaryButton onClick={handleOpenNew}>
              <Plus className="h-4 w-4" /> Schedule Service
            </PrimaryButton>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Assets"
            value={loading ? "..." : String(stats.total)}
            icon={Wrench}
            tone="primary"
          />
          <StatCard
            label="Healthy"
            value={loading ? "..." : String(stats.healthy)}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Due Soon"
            value={loading ? "..." : String(stats.dueSoon)}
            icon={Calendar}
            tone="warning"
          />
          <StatCard
            label="Overdue"
            value={loading ? "..." : String(stats.overdue)}
            icon={AlertCircle}
            tone="accent"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Assets">
              {/* Dynamic search and filter row */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search assets, location, vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {(["All", "Healthy", "Due Soon", "Overdue"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilter(s)}
                      className={`px-3 h-9 text-[11px] font-semibold rounded-lg transition ${
                        filter === s
                          ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant"
                          : "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : filteredAssets.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredAssets.map((a) => {
                    const health = getAssetHealth(a.status);
                    const category = getAssetCategory(a.asset_name);
                    return (
                      <div
                        key={a.id}
                        onClick={() => handleOpenEdit(a)}
                        className="rounded-xl glass p-4 hover:shadow-card transition cursor-pointer border border-border/50 hover:border-primary/30 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="grid place-items-center h-10 w-10 rounded-lg bg-[image:var(--gradient-primary)] text-white">
                                <Wrench className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm leading-snug">{a.asset_name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                  {category} · {a.location}
                                </div>
                              </div>
                            </div>
                            <Badge tone={tone(a.status)}>{a.status}</Badge>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Condition Rating</span>
                              <span className="font-semibold">{health}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${health}%`,
                                  background:
                                    health > 75
                                      ? "oklch(from var(--success) l c h)"
                                      : health > 50
                                        ? "oklch(from var(--warning) l c h)"
                                        : "oklch(from var(--destructive) l c h)",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Last: {formatDate(a.last_service_date)}</span>
                          <span>
                            Next:{" "}
                            <span className="font-semibold text-foreground/80">
                              {formatDate(a.next_due_date)}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="text-sm">No maintenance records found matching your filters.</p>
                </div>
              )}
            </Card>
          </div>

          <Card title="Upcoming Schedule">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : upcomingSchedule.length > 0 ? (
              <ol className="space-y-3">
                {upcomingSchedule.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl bg-foreground/[0.03] p-3 hover:bg-foreground/[0.06] transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>
                        {s.date} · {s.time}
                      </span>
                      <Badge tone={s.tone}>scheduled</Badge>
                    </div>
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Vendor: {s.vendor}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No upcoming service schedules.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Schedule / Edit Maintenance Modal Form */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl glass-strong border border-border/80 shadow-elegant p-6 sm:p-8 animate-scale-in">
            <button
              onClick={() => setOpenModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold mb-4 tracking-tight">
              {selectedAsset ? "Edit Maintenance Record" : "Schedule Asset Service"}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lift A1, STP Plant, Generator"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block A, Basement, Roof"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    value={lastServiceDate}
                    onChange={(e) => setLastServiceDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Service Cost ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full h-10 pl-8 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 mt-2 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Vendor & Service Details
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Vendor Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. Otis Care"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className="w-full h-10 pl-8 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Vendor Contact
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={vendorContact}
                        onChange={(e) => setVendorContact(e.target.value)}
                        className="w-full h-10 pl-8 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-1 focus:ring-ring transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t border-border/40 pt-4 mt-6">
                {selectedAsset && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleDelete}
                    className="h-10 px-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpenModal(false)}
                  className="h-10 px-4 rounded-lg hover:bg-foreground/5 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 px-4 items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {selectedAsset ? "Save Changes" : "Schedule Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
