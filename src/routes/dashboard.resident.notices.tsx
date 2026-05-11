import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Pin, Bell, BellOff } from "lucide-react";
import { Badge, Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { FilterPill, PageHeader } from "@/components/dashboard/PageHeader";

export const Route = createFileRoute("/dashboard/resident/notices")({
  head: () => ({ meta: [{ title: "Notices — Communa" }] }),
  component: ResidentNotices,
});

type Notice = {
  id: number; title: string; body: string; target: string;
  date: string; pinned: boolean; tag: string;
  tone: "warning" | "danger" | "success" | "primary" | "accent";
  read: boolean;
};

const seed: Notice[] = [
  { id: 1, title: "Water tank cleaning on Sunday", body: "There will be no water supply between 9 AM and 1 PM on May 18. Please store water in advance. This applies to all blocks.", target: "All Blocks", date: "May 11, 2026", pinned: true, tag: "Important", tone: "warning", read: false },
  { id: 2, title: "Fire drill scheduled — May 22", body: "A mandatory fire drill is scheduled at 11 AM on May 22. All residents are requested to participate and follow the evacuation procedure.", target: "All Blocks", date: "May 09, 2026", pinned: false, tag: "Safety", tone: "danger", read: false },
  { id: 3, title: "New gym equipment arrived", body: "New treadmills, dumbbells, and resistance bands have been installed in the community gym. Open from 6 AM to 10 PM daily.", target: "All Blocks", date: "May 05, 2026", pinned: false, tag: "Amenity", tone: "success", read: true },
  { id: 4, title: "Block B lift maintenance", body: "The lift in Block B will be unavailable on May 18 from 10 AM to 4 PM for quarterly maintenance. Please use the staircase.", target: "Block B", date: "May 03, 2026", pinned: false, tag: "Maintenance", tone: "primary", read: false },
  { id: 5, title: "Community Diwali celebration", body: "Join us for the annual Diwali celebration at the clubhouse on November 12 at 7 PM. Bring your family and enjoy the festivities!", target: "All Blocks", date: "Apr 28, 2026", pinned: false, tag: "Event", tone: "accent", read: true },
  { id: 6, title: "Updated visitor entry policy", body: "Effective May 1, all visitors must be pre-approved by residents via the Communa app. Walk-in visitors will require OTP verification at the gate.", target: "All Blocks", date: "Apr 25, 2026", pinned: false, tag: "Policy", tone: "primary", read: true },
];

function ResidentNotices() {
  const [notices, setNotices] = useState(seed);
  const [filter, setFilter] = useState("All");

  const tags = ["All", "Important", "Safety", "Maintenance", "Amenity", "Event", "Policy"];
  const filtered = notices.filter((n) => filter === "All" || n.tag === filter);
  const unread = notices.filter((n) => !n.read).length;

  const markRead = (id: number) => {
    setNotices((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader
          title="Notices & Announcements"
          subtitle="Stay updated with community announcements."
          actions={
            unread > 0 ? (
              <button
                onClick={markAllRead}
                className="inline-flex h-10 px-4 items-center gap-2 rounded-lg glass text-sm font-medium hover:bg-foreground/5 transition"
              >
                <BellOff className="h-4 w-4" /> Mark all read
              </button>
            ) : undefined
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl glass shadow-card p-5">
            <div className="text-xs text-muted-foreground">Total Notices</div>
            <div className="mt-2 text-2xl font-semibold">{notices.length}</div>
          </div>
          <div className="rounded-2xl glass shadow-card p-5">
            <div className="text-xs text-muted-foreground">Unread</div>
            <div className="mt-2 text-2xl font-semibold text-[color:var(--warning)]">{unread}</div>
          </div>
          <div className="rounded-2xl glass shadow-card p-5">
            <div className="text-xs text-muted-foreground">Pinned</div>
            <div className="mt-2 text-2xl font-semibold text-primary">{notices.filter((n) => n.pinned).length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((t) => (
            <FilterPill key={t} active={filter === t} onClick={() => setFilter(t)}>{t}</FilterPill>
          ))}
        </div>

        {/* Pinned notices */}
        {filter === "All" && notices.some((n) => n.pinned) && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pin className="h-3.5 w-3.5" /> Pinned
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {notices.filter((n) => n.pinned).map((n) => (
                <NoticeCard key={n.id} notice={n} onRead={markRead} />
              ))}
            </div>
          </div>
        )}

        {/* All notices */}
        <div>
          {filter === "All" && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Notices</div>}
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.filter((n) => filter !== "All" || !n.pinned).map((n) => (
              <NoticeCard key={n.id} notice={n} onRead={markRead} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No notices in this category.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function NoticeCard({ notice: n, onRead }: { notice: Notice; onRead: (id: number) => void }) {
  return (
    <div
      className={`rounded-2xl glass p-5 hover:shadow-card transition cursor-pointer ${!n.read ? "border border-primary/20" : ""}`}
      onClick={() => onRead(n.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] text-white shrink-0">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{n.target} · {n.date}</div>
            <div className="text-sm font-semibold mt-0.5 flex items-center gap-2">
              {n.title}
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {n.pinned && <Pin className="h-3.5 w-3.5 text-[color:var(--warning)]" />}
          {!n.read ? (
            <Bell className="h-3.5 w-3.5 text-primary" />
          ) : (
            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </div>
      <p className="text-xs text-foreground/75 leading-relaxed line-clamp-3">{n.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <Badge tone={n.tone}>{n.tag}</Badge>
        {!n.read && <span className="text-xs text-primary font-medium">Tap to mark read</span>}
      </div>
    </div>
  );
}
