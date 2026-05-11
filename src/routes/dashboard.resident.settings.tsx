import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Bell, Lock, Shield } from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { residentNav } from "@/components/dashboard/residentNav";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/dashboard/resident/settings")({
  head: () => ({ meta: [{ title: "Settings — Communa" }] }),
  component: ResidentSettings,
});

function ResidentSettings() {
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<"account" | "notifications" | "security" | "appearance">("account");

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Shield },
  ] as const;

  return (
    <DashboardLayout role="Resident" items={residentNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Settings" subtitle="Manage your account preferences." />

        <div className="grid lg:grid-cols-[240px_1fr] gap-4">
          {/* Tabs */}
          <nav className="rounded-2xl glass shadow-card p-2 h-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant"
                    : "text-foreground/75 hover:bg-foreground/5"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-4">
            {tab === "account" && (
              <Card title="Account Information">
                <div className="space-y-3">
                  {[
                    { label: "Name", value: "Anika Sharma" },
                    { label: "Email", value: "anika@mail.com" },
                    { label: "Phone", value: "+91 98200 33445" },
                    { label: "Flat", value: "B-302, Block B" },
                    { label: "Resident Since", value: "August 2023" },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-foreground/5 transition">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <button className="h-10 px-5 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition">
                    Edit Profile
                  </button>
                </div>
              </Card>
            )}

            {tab === "notifications" && (
              <Card title="Notification Preferences">
                <div className="space-y-2">
                  {[
                    { label: "New Notices", desc: "Get notified about community announcements", defaultOn: true },
                    { label: "Bill Reminders", desc: "Reminders for upcoming bill payments", defaultOn: true },
                    { label: "Complaint Updates", desc: "Status updates on your complaints", defaultOn: true },
                    { label: "Visitor Alerts", desc: "Notifications when visitors arrive", defaultOn: false },
                    { label: "Email Digest", desc: "Weekly summary via email", defaultOn: false },
                  ].map((n) => (
                    <Toggle key={n.label} label={n.label} desc={n.desc} defaultOn={n.defaultOn} />
                  ))}
                </div>
              </Card>
            )}

            {tab === "security" && (
              <Card title="Security Settings">
                <div className="space-y-4">
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">Current Password</span>
                      <input
                        type="password"
                        className="mt-1.5 w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">New Password</span>
                      <input
                        type="password"
                        className="mt-1.5 w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">Confirm New Password</span>
                      <input
                        type="password"
                        className="mt-1.5 w-full h-10 px-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                      />
                    </label>
                  </div>
                  <div className="pt-2">
                    <Toggle label="Two-factor authentication" desc="Add an extra layer of security" defaultOn={false} />
                  </div>
                  <div className="flex justify-end">
                    <button className="h-10 px-5 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition">
                      Update Password
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {tab === "appearance" && (
              <Card title="Appearance">
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => { if (t !== theme) toggle(); }}
                      className={`text-left rounded-2xl p-4 border-2 transition ${
                        theme === t
                          ? "border-primary shadow-elegant"
                          : "border-transparent glass hover:border-border"
                      }`}
                    >
                      <div
                        className={`h-24 rounded-xl mb-3 ${
                          t === "dark"
                            ? "bg-[oklch(0.14_0.025_260)]"
                            : "bg-[oklch(0.985_0.005_240)] border border-border"
                        }`}
                      />
                      <div className="text-sm font-semibold capitalize">{t} mode</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {t === "dark" ? "Easier on the eyes at night" : "Bright and clean for daytime"}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03]">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition ${
          on ? "bg-[image:var(--gradient-primary)]" : "bg-foreground/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
