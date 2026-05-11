import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Bell, Palette, Lock, Shield, Mail } from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { adminNav } from "@/components/dashboard/adminNav";
import { Field, GhostButton, PageHeader, PrimaryButton, SelectInput, TextInput } from "@/components/dashboard/PageHeader";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/dashboard/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Communa Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<"profile" | "notifications" | "appearance" | "security">("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Lock },
  ] as const;

  return (
    <DashboardLayout role="Admin" items={adminNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Settings" subtitle="Manage your profile and preferences." />

        <div className="grid lg:grid-cols-[240px_1fr] gap-4">
          <nav className="rounded-2xl glass shadow-card p-2 h-fit">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition " +
                  (tab === t.id ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant" : "text-foreground/75 hover:bg-foreground/5")}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>

          <div className="space-y-4">
            {tab === "profile" && (
              <Card title="Admin Profile">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-20 w-20 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-white text-2xl font-semibold">A</div>
                  <div>
                    <GhostButton>Change Photo</GhostButton>
                    <div className="text-[11px] text-muted-foreground mt-2">JPG or PNG · max 2MB</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Full Name"><TextInput defaultValue="Admin User" /></Field>
                  <Field label="Email"><TextInput defaultValue="admin@communa.app" /></Field>
                  <Field label="Phone"><TextInput defaultValue="+91 98200 00000" /></Field>
                  <Field label="Role"><SelectInput><option>Super Admin</option><option>Manager</option></SelectInput></Field>
                  <div className="sm:col-span-2"><Field label="Bio"><TextInput defaultValue="Operations head — Communa Heights" /></Field></div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-2">
                  <GhostButton>Cancel</GhostButton>
                  <PrimaryButton>Save Changes</PrimaryButton>
                </div>
              </Card>
            )}

            {tab === "notifications" && (
              <Card title="Notification Preferences">
                <div className="space-y-2">
                  {[
                    { i: Bell, l: "New complaints", d: "Get notified when residents file a complaint" },
                    { i: Mail, l: "Email digest", d: "Receive daily summary by email" },
                    { i: Shield, l: "Security alerts", d: "Visitor / gate anomalies" },
                    { i: Bell, l: "Payment reminders", d: "Notify when bills go overdue" },
                  ].map((n, i) => (
                    <Toggle key={i} icon={n.i} label={n.l} desc={n.d} defaultOn={i !== 1} />
                  ))}
                </div>
              </Card>
            )}

            {tab === "appearance" && (
              <Card title="Appearance">
                <div className="grid sm:grid-cols-2 gap-3">
                  {(["light", "dark"] as const).map((t) => (
                    <button key={t} onClick={() => { if (t !== theme) toggle(); }}
                      className={"text-left rounded-2xl p-4 border-2 transition " +
                        (theme === t ? "border-primary shadow-elegant" : "border-transparent glass hover:border-border")}>
                      <div className={"h-24 rounded-xl mb-3 " + (t === "dark" ? "bg-[oklch(0.14_0.025_260)]" : "bg-[oklch(0.985_0.005_240)] border border-border")} />
                      <div className="text-sm font-semibold capitalize">{t} mode</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t === "dark" ? "Easier on the eyes at night" : "Bright and clean for daytime"}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <Field label="Accent Color">
                    <div className="flex items-center gap-2">
                      {["265", "295", "195", "155", "25"].map((h) => (
                        <button key={h} className="h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary transition" style={{ background: `oklch(0.65 0.2 ${h})` }} />
                      ))}
                    </div>
                  </Field>
                </div>
              </Card>
            )}

            {tab === "security" && (
              <Card title="Security">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Current Password"><TextInput type="password" /></Field>
                  <Field label="New Password"><TextInput type="password" /></Field>
                </div>
                <div className="mt-5 space-y-2">
                  <Toggle icon={Shield} label="Two-factor authentication" desc="Add an extra security layer" defaultOn />
                  <Toggle icon={Lock} label="Login alerts" desc="Email when a new device signs in" defaultOn />
                </div>
                <div className="mt-5 flex items-center justify-end">
                  <PrimaryButton>Update Password</PrimaryButton>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Toggle({ icon: Icon, label, desc, defaultOn }: { icon: any; label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03]">
      <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)}
        className={"relative h-6 w-11 rounded-full transition " + (on ? "bg-[image:var(--gradient-primary)]" : "bg-foreground/15")}>
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition " + (on ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}
