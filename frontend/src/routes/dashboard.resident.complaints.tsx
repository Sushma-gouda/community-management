import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Clock, CheckCircle2, AlertCircle, Circle, ChevronRight } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { FilterPill, PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/resident/complaints")({
  head: () => ({ meta: [{ title: "My Complaints — Communa" }] }),
  component: ResidentComplaints,
});

type Status = "Open" | "In Progress" | "Resolved";
type Priority = "Low" | "Medium" | "High" | "Critical";
type Complaint = {
  id: string;
  title: string;
  desc: string;
  category: string;
  status: Status;
  priority: Priority;
  created: string;
  updated: string;
  timeline: { label: string; date: string; done: boolean }[];
};

const seed: Complaint[] = [
  {
    id: "C-2041",
    title: "Lift not working in Block B",
    desc: "The lift between floors 1 and 5 has been stuck since morning. Elderly residents are facing difficulty.",
    category: "Elevator",
    status: "Open",
    priority: "Critical",
    created: "May 9, 2026",
    updated: "2 hours ago",
    timeline: [
      { label: "Complaint Raised", date: "May 9, 09:30 AM", done: true },
      { label: "Acknowledged", date: "May 9, 10:00 AM", done: true },
      { label: "Assigned to Technician", date: "Pending", done: false },
      { label: "Resolved", date: "—", done: false },
    ],
  },
  {
    id: "C-2018",
    title: "AC drainage issue in bedroom",
    desc: "Water is dripping from the AC unit in the master bedroom. The wall is getting damp.",
    category: "Plumbing",
    status: "In Progress",
    priority: "High",
    created: "May 3, 2026",
    updated: "1 day ago",
    timeline: [
      { label: "Complaint Raised", date: "May 3, 02:15 PM", done: true },
      { label: "Acknowledged", date: "May 3, 03:00 PM", done: true },
      { label: "Assigned to Technician", date: "May 4, 10:00 AM", done: true },
      { label: "Resolved", date: "—", done: false },
    ],
  },
  {
    id: "C-1996",
    title: "Intercom not working",
    desc: "The intercom unit in the flat is not receiving calls from the gate.",
    category: "Electrical",
    status: "Resolved",
    priority: "Medium",
    created: "Apr 22, 2026",
    updated: "Apr 25, 2026",
    timeline: [
      { label: "Complaint Raised", date: "Apr 22, 11:00 AM", done: true },
      { label: "Acknowledged", date: "Apr 22, 11:30 AM", done: true },
      { label: "Assigned to Technician", date: "Apr 23, 09:00 AM", done: true },
      { label: "Resolved", date: "Apr 25, 04:00 PM", done: true },
    ],
  },
];

const categories = [
  "Elevator",
  "Plumbing",
  "Electrical",
  "Housekeeping",
  "Noise",
  "Security",
  "Other",
];

function ResidentComplaints() {
  const [data, setData] = useState(seed);
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Elevator",
    desc: "",
    priority: "Medium" as Priority,
  });

  const filtered = data.filter((c) => filter === "All" || c.status === filter);

  const statusTone = (s: Status) =>
    s === "Open" ? "warning" : s === "In Progress" ? "primary" : "success";
  const prioTone = (p: Priority) =>
    p === "Critical" ? "danger" : p === "High" ? "warning" : p === "Medium" ? "primary" : "muted";

  const StatusIcon = ({ s }: { s: Status }) =>
    s === "Resolved" ? (
      <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
    ) : s === "In Progress" ? (
      <Clock className="h-4 w-4 text-primary" />
    ) : (
      <AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />
    );

  const submit = () => {
    if (!form.title.trim()) return;
    const newC: Complaint = {
      id: `C-${2042 + data.length}`,
      title: form.title,
      desc: form.desc,
      category: form.category,
      status: "Open",
      priority: form.priority,
      created: "Just now",
      updated: "Just now",
      timeline: [
        { label: "Complaint Raised", date: "Just now", done: true },
        { label: "Acknowledged", date: "Pending", done: false },
        { label: "Assigned to Technician", date: "—", done: false },
        { label: "Resolved", date: "—", done: false },
      ],
    };
    setData([newC, ...data]);
    setForm({ title: "", category: "Elevator", desc: "", priority: "Medium" });
    setShowForm(false);
  };

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="My Complaints"
          subtitle="Track and manage your reported issues."
          actions={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex h-10 px-4 items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
            >
              <Plus className="h-4 w-4" /> Raise Complaint
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Open",
              value: data.filter((c) => c.status === "Open").length,
              color: "var(--warning)",
            },
            {
              label: "In Progress",
              value: data.filter((c) => c.status === "In Progress").length,
              color: "var(--primary)",
            },
            {
              label: "Resolved",
              value: data.filter((c) => c.status === "Resolved").length,
              color: "var(--success)",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl glass shadow-card p-5">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div
                className="mt-2 text-2xl font-semibold"
                style={{ color: `oklch(from ${s.color} l c h)` }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Open", "In Progress", "Resolved"] as const).map((f) => (
            <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </FilterPill>
          ))}
        </div>

        {/* Complaint cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="text-left rounded-2xl glass shadow-card p-5 hover:shadow-elegant transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs text-muted-foreground">
                  {c.id} · {c.category}
                </div>
                <Badge tone={prioTone(c.priority)}>{c.priority}</Badge>
              </div>
              <h3 className="font-semibold text-base group-hover:text-primary transition line-clamp-2">
                {c.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.desc}</p>

              {/* Mini timeline */}
              <div className="mt-4 flex items-center gap-1">
                {c.timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-1 flex-1">
                    <div
                      className={`h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-[image:var(--gradient-primary)]" : "bg-foreground/15"}`}
                    />
                    {i < c.timeline.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${t.done ? "bg-primary/40" : "bg-foreground/10"}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StatusIcon s={c.status} />
                  <span>{c.updated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No complaints found.
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-xl rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  {selected.id} · {selected.category}
                </div>
                <h3 className="text-xl font-semibold mt-1">{selected.title}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Badge tone={prioTone(selected.priority)}>{selected.priority}</Badge>
              <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                Raised: {selected.created}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{selected.desc}</p>

            {/* Timeline */}
            <div className="mt-6">
              <div className="text-sm font-semibold mb-4">Progress Timeline</div>
              <ol className="relative ml-3 space-y-4">
                {selected.timeline.map((t, i) => (
                  <li key={i} className="pl-6 relative">
                    <span
                      className={`absolute left-0 top-1 h-3 w-3 rounded-full border-2 ${t.done ? "bg-[image:var(--gradient-primary)] border-primary" : "bg-background border-border"}`}
                    />
                    {i < selected.timeline.length - 1 && (
                      <span
                        className={`absolute left-[5px] top-4 bottom-[-1rem] w-0.5 ${t.done ? "bg-primary/40" : "bg-border"}`}
                      />
                    )}
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="h-10 px-4 rounded-lg text-sm font-medium hover:bg-foreground/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New complaint form */}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl glass-strong shadow-elegant p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Raise a Complaint</h3>
              <button
                onClick={() => setShowForm(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="mt-1.5 w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Description</span>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  rows={4}
                  placeholder="Provide more details about the issue..."
                  className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Priority</span>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {(["Low", "Medium", "High", "Critical"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`h-9 rounded-lg text-xs font-medium transition border ${
                        form.priority === p
                          ? "bg-[image:var(--gradient-primary)] text-white border-transparent shadow-elegant"
                          : "bg-foreground/5 border-transparent hover:bg-foreground/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="h-10 px-4 rounded-lg text-sm font-medium hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="h-10 px-5 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
              >
                Submit Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
