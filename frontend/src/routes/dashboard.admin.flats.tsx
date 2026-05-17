import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/services/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import {
  Badge,
  Card,
  DashboardLayout,
  StatCard,
} from "@/components/dashboard/DashboardLayout";

import { adminNav } from "@/components/dashboard/adminNav";

import {
  Field,
  FilterPill,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  SelectInput,
  TextInput,
} from "@/components/dashboard/PageHeader";

import {
  fetchFlatsWithBlocks,
  insertFlat,
  updateFlat,
  deleteFlat,
  fetchBlocks,
} from "@/services/supabase/community";

export const Route = createFileRoute("/dashboard/admin/flats")({
  head: () => ({
    meta: [{ title: "Flats — Communa Admin" }],
  }),
  component: FlatsPage,
});

type Flat = {
  id: string;
  block_id: string;
  block: string;

  flat: string;
  floor: number;
  sqft: number;
  owner: string;

  status: "Occupied" | "Vacant" | "Reserved";
};

const normalizeStatus = (s: any) =>
  (s ?? "").toString().trim().toLowerCase();

function FlatsPage() {
  const [data, setData] = useState<Flat[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  const [q, setQ] = useState("");
  const [block, setBlock] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Flat | null>(null);

  const perPage = 10;

  async function loadFlats() {
    const rows: any[] = await fetchFlatsWithBlocks();

    setData(
      rows.map((r: any) => ({
        id: r.id,
        block_id: r.block_id,
        block: r.blocks?.name ?? "Unknown",
        flat: r.flat_number,
        floor: r.floor ?? 0,
        sqft: r.sqft ?? 0,
        owner: r.owner_name ?? "",

        status:
          normalizeStatus(r.status) === "occupied"
            ? "Occupied"
            : normalizeStatus(r.status) === "reserved"
              ? "Reserved"
              : "Vacant",
      }))
    );
  }

  useEffect(() => {
    loadFlats();
    fetchBlocks().then(setBlocks).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const matchQ =
        !q ||
        f.flat.toLowerCase().includes(q.toLowerCase()) ||
        f.owner.toLowerCase().includes(q.toLowerCase());

      const matchB = block === "All" || f.block === block;
      const matchS = status === "All" || f.status === status;

      return matchQ && matchB && matchS;
    });
  }, [data, q, block, status]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const tone = (s: Flat["status"]) =>
    s === "Occupied"
      ? "success"
      : s === "Vacant"
        ? "muted"
        : "warning";

  const occupiedCount = data.filter(f => f.status === "Occupied").length;
  const vacantCount = data.filter(f => f.status === "Vacant").length;
  const reservedCount = data.filter(f => f.status === "Reserved").length;
  const occupancyRate = data.length > 0 ? Math.round((occupiedCount / data.length) * 100) : 0;

  const onSave = async (f: Flat) => {
    if (editing) {
      const result = await updateFlat(f.id, {
        flat_number: f.flat,
        floor: f.floor,
        sqft: f.sqft,
        owner_name: f.owner,
        status: f.status.toLowerCase(),
      });

      if (result.error) return alert(result.error);
    } else {
      const result = await insertFlat({
        block_id: f.block_id,
        flat_number: f.flat,
        floor: f.floor,
        sqft: f.sqft,
        owner_name: f.owner,
        type: "2BHK",
      });

      if (result.error) return alert(result.error);
    }

    await loadFlats();
    setOpen(false);
    setEditing(null);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flat? This action cannot be undone.")) {
      return;
    }
    const result = await deleteFlat(id);
    if (result.error) return alert(result.error);

    await loadFlats();
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Flats Management"
          subtitle="Manage flat inventory and occupancy across all blocks."
          actions={
            <PrimaryButton
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Flat
            </PrimaryButton>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Flats"
            value={data.length.toString()}
            icon={Building2}
            tone="primary"
          />
          <StatCard
            label="Occupied"
            value={occupiedCount.toString()}
            change={`${occupancyRate}% occupancy`}
            icon={Building2}
            tone="success"
          />
          <StatCard
            label="Vacant"
            value={vacantCount.toString()}
            icon={Building2}
            tone="muted"
          />
          <StatCard
            label="Reserved"
            value={reservedCount.toString()}
            icon={Building2}
            tone="warning"
          />
        </div>

        {/* Filters and Search */}
        <Card
          title={`${filtered.length} Flats`}
          action={
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search flat or owner..."
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={block === "All"} onClick={() => { setBlock("All"); setPage(1); }}>
                All Blocks
              </FilterPill>
              {blocks.map((b) => (
                <FilterPill
                  key={b.id}
                  active={block === b.name}
                  onClick={() => { setBlock(b.name); setPage(1); }}
                >
                  {b.name}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <div className="flex flex-wrap gap-2">
              {["All", "Occupied", "Vacant", "Reserved"].map((s) => (
                <FilterPill
                  key={s}
                  active={status === s}
                  onClick={() => { setStatus(s); setPage(1); }}
                >
                  {s}
                </FilterPill>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground border-b border-border">
                  <th className="px-4 py-3">Flat</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Sqft</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {slice.length > 0 ? (
                  slice.map((f) => (
                    <tr key={f.id} className="hover:bg-foreground/3 transition">
                      <td className="px-4 py-3">
                        <span className="font-medium">{f.flat}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground/70">{f.block}</td>
                      <td className="px-4 py-3 text-foreground/70">{f.floor}</td>
                      <td className="px-4 py-3 text-foreground/70">{f.sqft} sqft</td>
                      <td className="px-4 py-3 text-foreground/70">{f.owner || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={tone(f.status)}>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditing(f); setOpen(true); }}
                            className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition"
                            title="Edit flat"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(f.id)}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                            title="Delete flat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>No flats found matching your criteria</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {slice.length > 0 ? (
              slice.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl glass hover:shadow-elegant transition border border-border/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{f.flat}</div>
                      <div className="text-xs text-muted-foreground">{f.block} • Floor {f.floor}</div>
                    </div>
                    <Badge tone={tone(f.status)}>{f.status}</Badge>
                  </div>
                  <div className="space-y-1 mb-3 text-sm text-foreground/70">
                    <div>Owner: {f.owner || "—"}</div>
                    <div>{f.sqft} sqft</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(f); setOpen(true); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(f.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-sm font-medium text-destructive transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <p>No flats found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Page {page} of {totalPages} • Showing {slice.length} of {filtered.length} flats
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      page === p
                        ? "bg-[image:var(--gradient-primary)] text-white"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <FlatModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        flat={editing}
        blocks={blocks}
        onSave={onSave}
      />
    </DashboardLayout>
  );
}

/* ================= MODAL ================= */

function FlatModal({
  open,
  onClose,
  flat,
  blocks,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  flat: Flat | null;
  blocks: any[];
  onSave: (f: Flat) => void;
}) {
  const [form, setForm] = useState<Flat>({
    id: crypto.randomUUID(),
    block_id: "",
    block: "",
    flat: "",
    floor: 1,
    sqft: 1000,
    owner: "",
    status: "Vacant",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (flat) {
      setForm(flat);
    } else {
      setForm({
        id: crypto.randomUUID(),
        block_id: "",
        block: "",
        flat: "",
        floor: 1,
        sqft: 1000,
        owner: "",
        status: "Vacant",
      });
    }
    setErrors({});
  }, [flat]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.block_id) newErrors.block_id = "Block is required";
    if (!form.flat.trim()) newErrors.flat = "Flat number is required";
    if (form.floor < 1) newErrors.floor = "Floor must be at least 1";
    if (form.sqft < 1) newErrors.sqft = "Sqft must be at least 1";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  if (!open) return null;

  const selectedBlock = blocks.find(b => b.id === form.block_id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={flat ? "Edit Flat" : "Add New Flat"}
      footer={
        <div className="flex gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSave}>
            {flat ? "Update Flat" : "Add Flat"}
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Block">
            <SelectInput
              value={form.block_id}
              onChange={(e: any) => {
                const selectedBlock = blocks.find(b => b.id === e.target.value);
                setForm({
                  ...form,
                  block_id: e.target.value,
                  block: selectedBlock?.name || "",
                });
                setErrors({ ...errors, block_id: "" });
              }}
            >
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectInput>
            {errors.block_id && (
              <p className="text-xs text-destructive mt-1">{errors.block_id}</p>
            )}
          </Field>

          <Field label="Flat Number">
            <TextInput
              placeholder="e.g., A-101"
              value={form.flat}
              onChange={(e: any) => {
                setForm({ ...form, flat: e.target.value });
                setErrors({ ...errors, flat: "" });
              }}
            />
            {errors.flat && (
              <p className="text-xs text-destructive mt-1">{errors.flat}</p>
            )}
          </Field>

          <Field label="Floor">
            <TextInput
              type="number"
              min="1"
              value={form.floor}
              onChange={(e: any) => {
                setForm({ ...form, floor: Number(e.target.value) });
                setErrors({ ...errors, floor: "" });
              }}
            />
            {errors.floor && (
              <p className="text-xs text-destructive mt-1">{errors.floor}</p>
            )}
          </Field>

          <Field label="Size (sqft)">
            <TextInput
              type="number"
              min="1"
              value={form.sqft}
              onChange={(e: any) => {
                setForm({ ...form, sqft: Number(e.target.value) });
                setErrors({ ...errors, sqft: "" });
              }}
            />
            {errors.sqft && (
              <p className="text-xs text-destructive mt-1">{errors.sqft}</p>
            )}
          </Field>

          <Field label="Owner Name">
            <TextInput
              placeholder="Leave empty if vacant"
              value={form.owner}
              onChange={(e: any) =>
                setForm({ ...form, owner: e.target.value })
              }
            />
          </Field>

          <Field label="Status">
            <SelectInput
              value={form.status}
              onChange={(e: any) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>Occupied</option>
              <option>Vacant</option>
              <option>Reserved</option>
            </SelectInput>
          </Field>
        </div>

        {selectedBlock && (
          <div className="p-3 rounded-lg bg-foreground/5 border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Block:</span> {selectedBlock.name} • <span className="font-medium">Total Units:</span> {selectedBlock.total_flats}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}