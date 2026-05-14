import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Pencil, Trash2, Building2 } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { Field, FilterPill, GhostButton, Modal, PageHeader, PrimaryButton, SelectInput, TextInput } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/flats")({
  head: () => ({ meta: [{ title: "Flats — Communa Admin" }] }),
  component: FlatsPage,
});

type Flat = {
  id: string; block: string; flat: string; floor: number; sqft: number; owner: string;
  status: "Occupied" | "Vacant" | "Reserved";
};

const seed: Flat[] = [
  { id: "1", block: "A", flat: "A-101", floor: 1, sqft: 1240, owner: "Ravi Kumar", status: "Occupied" },
  { id: "2", block: "A", flat: "A-204", floor: 2, sqft: 1450, owner: "Priya Mehta", status: "Occupied" },
  { id: "3", block: "B", flat: "B-302", floor: 3, sqft: 1620, owner: "Anika Sharma", status: "Occupied" },
  { id: "4", block: "B", flat: "B-401", floor: 4, sqft: 1620, owner: "—", status: "Vacant" },
  { id: "5", block: "C", flat: "C-105", floor: 1, sqft: 980, owner: "Sunil Joshi", status: "Reserved" },
  { id: "6", block: "C", flat: "C-204", floor: 2, sqft: 1240, owner: "Meera Pillai", status: "Occupied" },
  { id: "7", block: "D", flat: "D-405", floor: 4, sqft: 1820, owner: "Arjun Rao", status: "Occupied" },
  { id: "8", block: "D", flat: "D-501", floor: 5, sqft: 1820, owner: "—", status: "Vacant" },
];

function FlatsPage() {
  const [data, setData] = useState(seed);
  const [q, setQ] = useState("");
  const [block, setBlock] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Flat | null>(null);
  const perPage = 6;

  const filtered = useMemo(() => data.filter((f) => {
    const matchQ = !q || f.flat.toLowerCase().includes(q.toLowerCase()) || f.owner.toLowerCase().includes(q.toLowerCase());
    const matchB = block === "All" || f.block === block;
    const matchS = status === "All" || f.status === status;
    return matchQ && matchB && matchS;
  }), [data, q, block, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const tone = (s: Flat["status"]) => s === "Occupied" ? "success" : s === "Vacant" ? "muted" : "warning";

  const onSave = (f: Flat) => {
    setData((d) => editing ? d.map((x) => x.id === f.id ? f : x) : [...d, { ...f, id: String(Date.now()) }]);
    setOpen(false); setEditing(null);
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Flats"
          subtitle="Manage flat inventory across all blocks."
          actions={<PrimaryButton onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Add Flat</PrimaryButton>}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total Flats", v: data.length, t: "primary" },
            { l: "Occupied", v: data.filter(f => f.status === "Occupied").length, t: "success" },
            { l: "Vacant", v: data.filter(f => f.status === "Vacant").length, t: "warning" },
            { l: "Reserved", v: data.filter(f => f.status === "Reserved").length, t: "accent" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl glass shadow-card p-5">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-2 text-2xl font-semibold">{s.v}</div>
            </div>
          ))}
        </div>

        <Card title="All Flats" action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search flat or owner..." className="h-9 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:outline-none w-56" />
            </div>
          </div>
        }>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-1">Block:</span>
            {["All", "A", "B", "C", "D"].map((b) => (
              <FilterPill key={b} active={block === b} onClick={() => { setBlock(b); setPage(1); }}>{b}</FilterPill>
            ))}
            <span className="text-xs text-muted-foreground mx-1 ml-3">Status:</span>
            {["All", "Occupied", "Vacant", "Reserved"].map((s) => (
              <FilterPill key={s} active={status === s} onClick={() => { setStatus(s); setPage(1); }}>{s}</FilterPill>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-medium">Flat</th>
                  <th className="px-2 py-2 font-medium">Block</th>
                  <th className="px-2 py-2 font-medium">Floor</th>
                  <th className="px-2 py-2 font-medium">Sqft</th>
                  <th className="px-2 py-2 font-medium">Owner</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                    <td className="px-2 py-3 font-medium flex items-center gap-2">
                      <span className="grid place-items-center h-7 w-7 rounded-md bg-primary/10 text-primary"><Building2 className="h-3.5 w-3.5" /></span>
                      {f.flat}
                    </td>
                    <td className="px-2 py-3">Block {f.block}</td>
                    <td className="px-2 py-3">{f.floor}</td>
                    <td className="px-2 py-3">{f.sqft}</td>
                    <td className="px-2 py-3 text-foreground/80">{f.owner}</td>
                    <td className="px-2 py-3"><Badge tone={tone(f.status)}>{f.status}</Badge></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(f); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5 text-foreground/70"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setData((d) => d.filter((x) => x.id !== f.id))} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {slice.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No flats match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {slice.length} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 px-3 rounded-lg hover:bg-foreground/5">Prev</button>
              <span className="px-2">Page {page} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="h-8 px-3 rounded-lg hover:bg-foreground/5">Next</button>
            </div>
          </div>
        </Card>
      </div>

      <FlatModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        flat={editing}
        onSave={onSave}
      />
    </DashboardLayout>
  );
}

const emptyFlat = (): Flat => ({ id: "", block: "A", flat: "", floor: 1, sqft: 1000, owner: "", status: "Vacant" });

function FlatModal({ open, onClose, flat, onSave }: { open: boolean; onClose: () => void; flat: Flat | null; onSave: (f: Flat) => void }) {
  const [form, setForm] = useState<Flat>(() => flat ?? emptyFlat());

  useEffect(() => {
    if (!open) return;
    setForm(flat ? { ...flat } : emptyFlat());
  }, [open, flat]);

  return (
    <Modal open={open} onClose={onClose} title={flat ? "Edit Flat" : "Add Flat"} footer={
      <>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={() => onSave(form)}>{flat ? "Save changes" : "Create flat"}</PrimaryButton>
      </>
    }>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Block"><SelectInput value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })}>{["A","B","C","D"].map(b => <option key={b}>{b}</option>)}</SelectInput></Field>
        <Field label="Flat Number"><TextInput value={form.flat} onChange={(e) => setForm({ ...form, flat: e.target.value })} placeholder="A-101" /></Field>
        <Field label="Floor"><TextInput type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: +e.target.value })} /></Field>
        <Field label="Sqft"><TextInput type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: +e.target.value })} /></Field>
        <div className="col-span-2"><Field label="Owner Name"><TextInput value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></Field></div>
        <div className="col-span-2"><Field label="Status">
          <SelectInput value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Flat["status"] })}>
            {["Occupied", "Vacant", "Reserved"].map((s) => <option key={s}>{s}</option>)}
          </SelectInput>
        </Field></div>
      </div>
    </Modal>
  );
}
