import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { type LucideIcon, Search, UserPlus, Mail, Phone, Building2, X } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { FilterPill, PageHeader, PrimaryButton } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/residents")({
  head: () => ({ meta: [{ title: "Residents — Communa Admin" }] }),
  component: ResidentsPage,
});

type Resident = {
  id: string;
  name: string;
  email: string;
  phone: string;
  flat: string;
  block: string;
  status: "Active" | "Inactive";
  since: string;
  family: number;
};

const data: Resident[] = [
  {
    id: "1",
    name: "Ravi Kumar",
    email: "ravi@mail.com",
    phone: "+91 98200 11223",
    flat: "A-101",
    block: "A",
    status: "Active",
    since: "Jan 2022",
    family: 4,
  },
  {
    id: "2",
    name: "Priya Mehta",
    email: "priya@mail.com",
    phone: "+91 98200 22334",
    flat: "A-204",
    block: "A",
    status: "Active",
    since: "Mar 2021",
    family: 3,
  },
  {
    id: "3",
    name: "Anika Sharma",
    email: "anika@mail.com",
    phone: "+91 98200 33445",
    flat: "B-302",
    block: "B",
    status: "Active",
    since: "Aug 2023",
    family: 2,
  },
  {
    id: "4",
    name: "Sunil Joshi",
    email: "sunil@mail.com",
    phone: "+91 98200 44556",
    flat: "C-105",
    block: "C",
    status: "Inactive",
    since: "Feb 2020",
    family: 5,
  },
  {
    id: "5",
    name: "Meera Pillai",
    email: "meera@mail.com",
    phone: "+91 98200 55667",
    flat: "C-204",
    block: "C",
    status: "Active",
    since: "Nov 2022",
    family: 3,
  },
  {
    id: "6",
    name: "Arjun Rao",
    email: "arjun@mail.com",
    phone: "+91 98200 66778",
    flat: "D-405",
    block: "D",
    status: "Active",
    since: "Jun 2024",
    family: 2,
  },
];

function ResidentsPage() {
  const [q, setQ] = useState("");
  const [block, setBlock] = useState("All");
  const [selected, setSelected] = useState<Resident | null>(null);

  const filtered = useMemo(
    () =>
      data.filter((r) => {
        const matchQ =
          !q ||
          r.name.toLowerCase().includes(q.toLowerCase()) ||
          r.flat.toLowerCase().includes(q.toLowerCase());
        return matchQ && (block === "All" || r.block === block);
      }),
    [q, block],
  );

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Residents"
          subtitle="Directory of all residents across the community."
          actions={
            <PrimaryButton>
              <UserPlus className="h-4 w-4" /> Add Resident
            </PrimaryButton>
          }
        />

        <Card
          title={`${filtered.length} Residents`}
          action={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or flat..."
                className="h-9 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:border-input focus:outline-none w-56"
              />
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {["All", "A", "B", "C", "D"].map((b) => (
              <FilterPill key={b} active={block === b} onClick={() => setBlock(b)}>
                Block {b}
              </FilterPill>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="grid sm:hidden gap-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="text-left p-4 rounded-xl glass hover:shadow-card transition"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.flat} · Block {r.block}
                    </div>
                  </div>
                  <Badge tone={r.status === "Active" ? "success" : "muted"}>{r.status}</Badge>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Flat</th>
                  <th className="px-2 py-2 font-medium">Block</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="border-b border-border last:border-0 hover:bg-foreground/[0.03] cursor-pointer"
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} />
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-foreground/80">{r.email}</td>
                    <td className="px-2 py-3 text-foreground/80">{r.phone}</td>
                    <td className="px-2 py-3">{r.flat}</td>
                    <td className="px-2 py-3">Block {r.block}</td>
                    <td className="px-2 py-3">
                      <Badge tone={r.status === "Active" ? "success" : "muted"}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Drawer */}
      <div
        className={
          "fixed inset-0 z-50 transition " +
          (selected ? "pointer-events-auto" : "pointer-events-none")
        }
      >
        <div
          onClick={() => setSelected(null)}
          className={
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition " +
            (selected ? "opacity-100" : "opacity-0")
          }
        />
        <aside
          className={
            "absolute right-0 top-0 h-full w-full sm:w-[420px] glass-strong shadow-elegant transition-transform duration-300 " +
            (selected ? "translate-x-0" : "translate-x-full")
          }
        >
          {selected && (
            <div className="h-full flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-semibold">Resident Profile</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-foreground/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex flex-col items-center text-center">
                  <Avatar name={selected.name} size="lg" />
                  <div className="mt-3 text-xl font-semibold">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Resident since {selected.since}
                  </div>
                  <Badge tone={selected.status === "Active" ? "success" : "muted"}>
                    {selected.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Family Members" value={String(selected.family)} />
                  <Stat label="Flat" value={selected.flat} />
                </div>
                <div className="space-y-2.5">
                  <Row icon={Mail} label="Email" value={selected.email} />
                  <Row icon={Phone} label="Phone" value={selected.phone} />
                  <Row icon={Building2} label="Block" value={`Block ${selected.block}`} />
                </div>
                <div className="pt-3 flex items-center gap-2">
                  <PrimaryButton>Edit Profile</PrimaryButton>
                  <button className="h-10 px-4 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const cls = size === "lg" ? "h-16 w-16 text-lg" : "h-9 w-9 text-xs";
  return (
    <div
      className={`grid place-items-center rounded-full bg-[image:var(--gradient-primary)] text-white font-semibold ${cls}`}
    >
      {initials}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03]">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass p-3 text-center">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
