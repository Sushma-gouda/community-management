import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/services/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Building2,
} from "lucide-react";

import {
  Badge,
  Card,
  DashboardLayout,
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

  const perPage = 6;

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

    supabase
      .from("blocks")
      .select("*")
      .then(({ data }) => setBlocks(data || []));
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

  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const tone = (s: Flat["status"]) =>
    s === "Occupied"
      ? "success"
      : s === "Vacant"
        ? "muted"
        : "warning";

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
    const result = await deleteFlat(id);
    if (result.error) return alert(result.error);

    await loadFlats();
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">

        <PageHeader
          title="Flats"
          subtitle="Manage flat inventory across all blocks."
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total Flats", v: data.length },
            { l: "Occupied", v: data.filter(f => f.status === "Occupied").length },
            { l: "Vacant", v: data.filter(f => f.status === "Vacant").length },
            { l: "Reserved", v: data.filter(f => f.status === "Reserved").length },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl glass shadow-card p-5">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-2 text-2xl font-semibold">{s.v}</div>
            </div>
          ))}
        </div>

        <Card
          title="All Flats"
          action={
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search flat or owner..."
                className="h-9 px-3 text-sm rounded-lg bg-foreground/5"
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs">
                  <th>Flat</th>
                  <th>Block</th>
                  <th>Floor</th>
                  <th>Sqft</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {slice.map((f) => (
                  <tr key={f.id}>
                    <td>{f.flat}</td>
                    <td>{f.block}</td>
                    <td>{f.floor}</td>
                    <td>{f.sqft}</td>
                    <td>{f.owner}</td>
                    <td>
                      <Badge tone={tone(f.status)}>
                        {f.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <button onClick={() => { setEditing(f); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(f.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

  useEffect(() => {
    if (flat) setForm(flat);
  }, [flat]);

  return (
    <Modal open={open} onClose={onClose} title={flat ? "Edit Flat" : "Add Flat"}>
      <div className="grid grid-cols-2 gap-3">

        <Field label="Block">
          <SelectInput
            value={form.block_id}
            onChange={(e: any) =>
              setForm({ ...form, block_id: e.target.value })
            }
          >
            <option value="">Select Block</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Flat Number">
          <TextInput
            value={form.flat}
            onChange={(e: any) =>
              setForm({ ...form, flat: e.target.value })
            }
          />
        </Field>

        <Field label="Floor">
          <TextInput
            type="number"
            value={form.floor}
            onChange={(e: any) =>
              setForm({ ...form, floor: Number(e.target.value) })
            }
          />
        </Field>

        <Field label="Sqft">
          <TextInput
            type="number"
            value={form.sqft}
            onChange={(e: any) =>
              setForm({ ...form, sqft: Number(e.target.value) })
            }
          />
        </Field>

        <Field label="Owner">
          <TextInput
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

      <div className="flex justify-end gap-2 mt-4">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={() => onSave(form)}>
          Save
        </PrimaryButton>
      </div>
    </Modal>
  );
}