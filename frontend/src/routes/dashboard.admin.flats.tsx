import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Plus, Home, Building2, X, Edit, Trash2 } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { FilterPill, PageHeader, PrimaryButton } from "@/components/dashboard/PageHeader";
import {
  fetchFlatsWithBlocks,
  fetchBlocks,
  insertFlat,
  updateFlat,
  deleteFlat,
  type FlatRow,
  type BlockRow,
} from "@/services/supabase/community";
import { Field } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/dashboard/admin/flats")({
  head: () => ({ meta: [{ title: "Flats — Communa Admin" }] }),
  component: FlatsPage,
});

function FlatsPage() {
  const [flats, setFlats] = useState<Array<FlatRow & { block_name: string }>>([]);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [q, setQ] = useState("");
  const [occupancyStatusFilter, setoccupancyStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<FlatRow | null>(null);

  const [formData, setFormData] = useState({
    block_name: "",
    flat_number: "",
    floor: "",
    sqft: "",
    owner_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const [fData, bData] = await Promise.all([fetchFlatsWithBlocks(), fetchBlocks()]);
    setFlats(fData);
    setBlocks(bData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return flats.filter((f) => {
      const matchQ =
        !q ||
        f.flat_number.toLowerCase().includes(q.toLowerCase()) ||
        f.block_name.toLowerCase().includes(q.toLowerCase()) ||
        (f.owner_name && f.owner_name.toLowerCase().includes(q.toLowerCase()));
      const matchStatus = occupancyStatusFilter === "All" || f.occupancy_status === occupancyStatusFilter.toLowerCase();
      return matchQ && matchStatus;
    });
  }, [flats, q, occupancyStatusFilter]);

  const handleOpenModal = (flat?: FlatRow & { block_name: string }) => {
    setError(null);
    if (flat) {
      setEditingFlat(flat);
      setFormData({
        block_name: flat.block_name,
        flat_number: flat.flat_number,
        floor: flat.floor?.toString() || "",
        sqft: flat.sqft?.toString() || "",
        owner_name: flat.owner_name || "",
      });
    } else {
      setEditingFlat(null);
      setFormData({
        block_name: blocks.length > 0 ? blocks[0].id : "",
        flat_number: "",
        floor: "",
        sqft: "",
        owner_name: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      block_name: formData.block_name,
      flat_number: formData.flat_number.trim(),
      floor: formData.floor ? parseInt(formData.floor, 10) : null,
      sqft: formData.sqft ? parseInt(formData.sqft, 10) : null,
      owner_name: formData.owner_name.trim() || null,
    };

    if (!payload.block_name || !payload.flat_number) {
      setError("Block and Flat Number are required.");
      setLoading(false);
      return;
    }

    let err: string | null = null;
    if (editingFlat) {
      const { error } = await updateFlat(editingFlat.id, payload);
      err = error;
    } else {
      const { error } = await insertFlat(payload);
      err = error;
    }

    setLoading(false);
    if (err) {
      setError(err);
    } else {
      await loadData();
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flat?")) return;
    const { error } = await deleteFlat(id);
    if (error) {
      alert("Error deleting flat: " + error);
    } else {
      await loadData();
    }
  };

  const handleVacate = async (id: string) => {
    if (!confirm("Are you sure you want to mark this flat as vacant? This should be done when a resident is removed or inactive.")) return;
    const { error } = await updateFlat(id, { occupancy_status: "vacant" });
    if (error) {
      alert("Error updating flat: " + error);
    } else {
      await loadData();
    }
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Flats Management"
          subtitle="Manage all flats, occupancy, and properties."
          actions={
            <PrimaryButton onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" /> Add Flat
            </PrimaryButton>
          }
        />

        <Card
          title={`${filtered.length} Flats`}
          action={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search flat, block or owner..."
                className="h-9 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:outline-none w-64 transition"
              />
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {["All", "Vacant", "Occupied"].map((s) => (
              <FilterPill key={s} active={occupancyStatusFilter === s} onClick={() => setoccupancyStatusFilter(s)}>
                {s}
              </FilterPill>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-medium">Flat</th>
                  <th className="px-2 py-2 font-medium">Block</th>
                  <th className="px-2 py-2 font-medium">Owner</th>
                  <th className="px-2 py-2 font-medium">Sqft</th>
                  <th className="px-2 py-2 font-medium">Floor</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Added</th>
                  <th className="px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-muted-foreground">
                      No flats found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-border last:border-0 hover:bg-foreground/[0.03] transition-colors"
                    >
                      <td className="px-2 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary" />
                          {f.flat_number}
                        </div>
                      </td>
                      <td className="px-2 py-3">{f.block_name}</td>
                      <td className="px-2 py-3 text-foreground/80">{f.owner_name || "—"}</td>
                      <td className="px-2 py-3 text-foreground/80">{f.sqft || "—"}</td>
                      <td className="px-2 py-3 text-foreground/80">{f.floor || "—"}</td>
                      <td className="px-2 py-3">
                        <Badge tone={f.occupancy_status === "occupied" ? "success" : "warning"}>
                          {f.occupancy_status.charAt(0).toUpperCase() + f.occupancy_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-2 py-3 text-foreground/80 text-[11px]">
                        {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {f.occupancy_status === "occupied" && (
                            <button
                              onClick={() => handleVacate(f.id)}
                              className="px-2 py-1.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                              title="Mark as Vacant"
                            >
                              Vacate
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(f)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-md rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold">{editingFlat ? "Edit Flat" : "Add Flat"}</h3>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <label className="block">
                <div className="text-xs font-medium text-foreground/80 mb-1.5">Block Name *</div>
                <select
                  required
                  value={formData.block_name}
                  onChange={(e) => setFormData({ ...formData, block_name: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                >
                  <option value="">Select Block</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <Field
                label="Flat Number"
                name="flat_number"
                required
                value={formData.flat_number}
                onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Floor"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  disabled={loading}
                />
                <Field
                  label="Sqft"
                  name="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                  disabled={loading}
                />
              </div>

              <Field
                label="Owner Name"
                name="owner_name"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                disabled={loading}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Flat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}




