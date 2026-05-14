import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bold, Italic, List, Link2, Megaphone, Pin, Send } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { Field, FilterPill, PageHeader, PrimaryButton, SelectInput, TextInput } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/admin/notices")({
  head: () => ({ meta: [{ title: "Notices — Communa Admin" }] }),
  component: NoticesPage,
});

type NoticeRow = {
  id: number;
  title: string;
  body: string;
  target: string;
  date: string;
  pinned: boolean;
  tag: string;
  tone: "warning" | "danger" | "success" | "primary" | "accent" | "muted";
};

const tagTone = (tag: string): NoticeRow["tone"] => {
  if (tag === "Important") return "warning";
  if (tag === "Safety") return "danger";
  if (tag === "Amenity") return "success";
  if (tag === "Maintenance") return "primary";
  return "accent";
};

const seedNotices: NoticeRow[] = [
  { id: 1, title: "Water tank cleaning on Sunday", body: "There will be no water supply between 9 AM and 1 PM. Please store water in advance.", target: "All Blocks", date: "May 11", pinned: true, tag: "Important", tone: "warning" },
  { id: 2, title: "Fire drill scheduled - May 22", body: "Mandatory fire drill at 11 AM. All residents are requested to participate.", target: "All Blocks", date: "May 09", pinned: false, tag: "Safety", tone: "danger" },
  { id: 3, title: "New gym equipment arrived", body: "Treadmills and dumbbells installed in the community gym. Open from 6 AM to 10 PM.", target: "All Blocks", date: "May 05", pinned: false, tag: "Amenity", tone: "success" },
  { id: 4, title: "Block A lift maintenance", body: "Lift in Block A will be unavailable on May 18 from 10 AM to 4 PM.", target: "Block A", date: "May 03", pinned: false, tag: "Maintenance", tone: "primary" },
];

function NoticesPage() {
  const [notices, setNotices] = useState<NoticeRow[]>(seedNotices);
  const [filter, setFilter] = useState("All");
  const [compose, setCompose] = useState({
    title: "",
    tag: "Important",
    body: "",
    target: "All Blocks",
    schedule: "",
  });

  const publish = () => {
    if (!compose.title.trim() || !compose.body.trim()) return;
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const nextId = Math.max(0, ...notices.map((n) => n.id)) + 1;
    const tone = tagTone(compose.tag);
    setNotices((prev) => [
      {
        id: nextId,
        title: compose.title.trim(),
        body: compose.body.trim(),
        target: compose.target,
        date: dateStr,
        pinned: false,
        tag: compose.tag,
        tone,
      },
      ...prev,
    ]);
    setCompose({ title: "", tag: "Important", body: "", target: "All Blocks", schedule: "" });
  };

  const saveDraft = () => {
    if (!compose.title.trim()) return;
    const nextId = Math.max(0, ...notices.map((n) => n.id)) + 1;
    setNotices((prev) => [
      {
        id: nextId,
        title: `[Draft] ${compose.title.trim()}`,
        body: compose.body.trim() || "No content yet.",
        target: compose.target,
        date: "Draft",
        pinned: false,
        tag: compose.tag,
        tone: "muted" as NoticeRow["tone"],
      },
      ...prev,
    ]);
  };

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Notices" subtitle="Broadcast announcements to residents." />

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card title="Compose Notice" action={<Badge tone="primary">Draft</Badge>}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title">
                  <TextInput
                    placeholder="Write a clear title..."
                    value={compose.title}
                    onChange={(e) => setCompose({ ...compose, title: e.target.value })}
                  />
                </Field>
                <Field label="Tag">
                  <SelectInput
                    value={compose.tag}
                    onChange={(e) => setCompose({ ...compose, tag: e.target.value })}
                  >
                    <option>Important</option>
                    <option>Safety</option>
                    <option>Maintenance</option>
                    <option>Amenity</option>
                  </SelectInput>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Message">
                  <div className="rounded-lg bg-foreground/5 border border-transparent focus-within:border-input">
                    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50">
                      {[Bold, Italic, List, Link2].map((Icon, i) => (
                        <button type="button" key={i} className="h-7 w-7 grid place-items-center rounded-md hover:bg-foreground/5 text-foreground/70"><Icon className="h-3.5 w-3.5" /></button>
                      ))}
                    </div>
                    <textarea
                      rows={6}
                      placeholder="Type your announcement here..."
                      value={compose.body}
                      onChange={(e) => setCompose({ ...compose, body: e.target.value })}
                      className="w-full bg-transparent p-3 text-sm focus:outline-none resize-none"
                    />
                  </div>
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Target Audience">
                  <SelectInput
                    value={compose.target}
                    onChange={(e) => setCompose({ ...compose, target: e.target.value })}
                  >
                    <option>All Blocks</option>
                    <option>Block A</option>
                    <option>Block B</option>
                    <option>Block C</option>
                    <option>Block D</option>
                  </SelectInput>
                </Field>
                <Field label="Schedule">
                  <TextInput
                    type="datetime-local"
                    value={compose.schedule}
                    onChange={(e) => setCompose({ ...compose, schedule: e.target.value })}
                  />
                </Field>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={saveDraft} className="h-10 px-4 rounded-lg text-sm font-medium hover:bg-foreground/5">
                  Save Draft
                </button>
                <PrimaryButton onClick={publish}><Send className="h-4 w-4" /> Publish Notice</PrimaryButton>
              </div>
            </Card>
          </div>

          <Card title="Block Targeting">
            <div className="space-y-3">
              {[
                { b: "All Blocks", count: "1,284 residents" },
                { b: "Block A", count: "320 residents" },
                { b: "Block B", count: "315 residents" },
                { b: "Block C", count: "295 residents" },
                { b: "Block D", count: "354 residents" },
              ].map((t) => (
                <label key={t.b} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06] cursor-pointer transition">
                  <input type="checkbox" defaultChecked={t.b === "All Blocks"} className="h-4 w-4 accent-[oklch(from_var(--primary)_l_c_h)]" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.b}</div>
                    <div className="text-[11px] text-muted-foreground">{t.count}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Published Notices" action={
          <div className="flex items-center gap-1">
            {["All", "Important", "Safety", "Amenity", "Maintenance"].map((f) => (
              <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterPill>
            ))}
          </div>
        }>
          <div className="grid md:grid-cols-2 gap-3">
            {notices.filter(n => filter === "All" || n.tag === filter).map((n) => (
              <div key={n.id} className="rounded-xl glass p-4 hover:shadow-card transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center h-9 w-9 rounded-lg bg-[image:var(--gradient-primary)] text-white"><Megaphone className="h-4 w-4" /></div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">{n.target} · {n.date}</div>
                      <div className="text-sm font-semibold">{n.title}</div>
                    </div>
                  </div>
                  {n.pinned && <Pin className="h-3.5 w-3.5 text-[color:var(--warning)]" />}
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed">{n.body}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={n.tone}>{n.tag}</Badge>
                  <button className="text-xs text-primary hover:underline">View details</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
