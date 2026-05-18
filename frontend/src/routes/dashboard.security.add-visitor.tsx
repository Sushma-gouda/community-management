import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { UserPlus, CheckCircle2, Phone, Car, Building2, User, FileText } from "lucide-react";
import { Card, DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { securityNav } from "@/components/dashboard/securityNav";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { fetchFlatsWithBlocks, insertVisitor } from "@/services/supabase/community";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/dashboard/security/add-visitor")({
  head: () => ({ meta: [{ title: "Add Visitor — Communa Security" }] }),
  component: AddVisitor,
});

type VisitorType = "Guest" | "Delivery" | "Service" | "Cab";

function AddVisitor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicle: "",
    flat: "",
    purpose: "Guest" as VisitorType,
    notes: "",
  });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [dbFlats, setDbFlats] = useState<any[]>([]);

  useEffect(() => {
    fetchFlatsWithBlocks().then((data) => {
      const sorted = (data ?? []).sort((a, b) => {
        const blockA = a.blocks?.name || "";
        const blockB = b.blocks?.name || "";
        if (blockA !== blockB) return blockA.localeCompare(blockB);
        return a.flat_number.localeCompare(b.flat_number);
      });
      setDbFlats(sorted);
    });
  }, []);

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.flat) return;
    setStep("otp");
  };

  const handleOtp = async () => {
    try {
      const { error } = await insertVisitor({
        name: form.name,
        phone: form.phone,
        flat_id: form.flat,
        purpose: form.purpose,
        vehicle_number: form.vehicle || undefined,
        security_id: user?.id,
      });

      if (error) {
        alert("Failed to create visitor: " + error);
        return;
      }

      setStep("success");
      setTimeout(() => navigate({ to: "/dashboard/security/active-visitors" }), 2000);
    } catch (err: any) {
      alert("An unexpected error occurred: " + err.message);
    }
  };

  const purposeColors: Record<VisitorType, string> = {
    Guest: "var(--primary)",
    Delivery: "var(--warning)",
    Service: "var(--accent)",
    Cab: "var(--success)",
  };

  return (
    <DashboardLayout role="Security" items={securityNav}>
      <div className="space-y-6 animate-fade-up">
        <PageHeader title="Add Visitor" subtitle="Register a new visitor entry at the gate." />

        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {[
            { label: "Visitor Details", step: "form" },
            { label: "OTP Verification", step: "otp" },
            { label: "Entry Created", step: "success" },
          ].map((s, i) => {
            const steps = ["form", "otp", "success"];
            const current = steps.indexOf(step);
            const idx = steps.indexOf(s.step);
            const done = idx < current;
            const active = idx === current;
            return (
              <div key={s.step} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center gap-2 ${active ? "text-primary" : done ? "text-[color:var(--success)]" : "text-muted-foreground"}`}
                >
                  <div
                    className={`h-7 w-7 rounded-full grid place-items-center text-xs font-semibold border-2 transition ${
                      done
                        ? "bg-[color:var(--success)]/15 border-[color:var(--success)] text-[color:var(--success)]"
                        : active
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-foreground/5 border-border"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 ${done ? "bg-[color:var(--success)]/40" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="max-w-2xl">
          {step === "form" && (
            <Card title="Visitor Information">
              <div className="space-y-4">
                {/* Visitor type */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Visitor Type</div>
                  <div className="grid grid-cols-4 gap-2">
                    {(["Guest", "Delivery", "Service", "Cab"] as VisitorType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, purpose: t })}
                        className={`h-10 rounded-xl text-xs font-medium transition border-2 ${
                          form.purpose === t
                            ? "border-transparent text-white shadow-elegant"
                            : "border-transparent bg-foreground/5 hover:bg-foreground/10"
                        }`}
                        style={
                          form.purpose === t
                            ? { background: `oklch(from ${purposeColors[t]} l c h)` }
                            : {}
                        }
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <FormField
                    label="Visitor Name"
                    icon={<User className="h-4 w-4" />}
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Full name"
                    required
                  />
                  <FormField
                    label="Phone Number"
                    icon={<Phone className="h-4 w-4" />}
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="+91 XXXXX XXXXX"
                    type="tel"
                    required
                  />
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">
                        Flat Number <span className="text-destructive">*</span>
                      </span>
                      <div className="mt-1.5 relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={form.flat}
                          onChange={(e) => setForm({ ...form, flat: e.target.value })}
                          className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
                        >
                          <option value="">Select flat…</option>
                          {dbFlats.map((f) => {
                            const label = `${f.blocks?.name || ""}-${f.flat_number}`;
                            return (
                              <option key={f.id} value={f.id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </label>
                  </div>
                  <FormField
                    label="Vehicle Number"
                    icon={<Car className="h-4 w-4" />}
                    value={form.vehicle}
                    onChange={(v) => setForm({ ...form, vehicle: v })}
                    placeholder="MH-12 AB-1234 (optional)"
                  />
                  <div className="sm:col-span-2">
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">
                        Purpose / Notes
                      </span>
                      <div className="mt-1.5 relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          rows={3}
                          placeholder="Brief purpose of visit..."
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!form.name || !form.phone || !form.flat}
                    className="h-10 px-6 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send OTP to Resident
                  </button>
                </div>
              </div>
            </Card>
          )}

          {step === "otp" && (
            <Card title="OTP Verification">
              <div className="text-center py-4">
                <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <div className="text-lg font-semibold">Verify with OTP</div>
                <div className="text-sm text-muted-foreground mt-1">
                  OTP sent to resident of {dbFlats.find((f) => f.id === form.flat)?.blocks?.name || ""}-{dbFlats.find((f) => f.id === form.flat)?.flat_number || "selected flat"}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium text-muted-foreground text-center mb-3">
                  Enter 4-digit OTP
                </div>
                <div className="flex items-center justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const next = [...otp];
                        next[i] = val;
                        setOtp(next);
                        if (val && i < 3) {
                          const nextInput = document.getElementById(`otp-${i + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      id={`otp-${i}`}
                      className="h-14 w-14 text-center text-2xl font-semibold rounded-xl bg-foreground/5 border-2 border-transparent focus:border-primary focus:bg-background focus:outline-none transition"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep("form")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  onClick={handleOtp}
                  className="h-10 px-6 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium shadow-elegant hover:shadow-glow transition"
                >
                  Verify & Allow Entry
                </button>
              </div>
            </Card>
          )}

          {step === "success" && (
            <Card title="Entry Created">
              <div className="text-center py-8">
                <div className="mx-auto grid place-items-center h-20 w-20 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] mb-4 animate-scale-in">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="text-2xl font-semibold">Entry Successful!</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {form.name} has been checked in to {dbFlats.find((f) => f.id === form.flat)?.blocks?.name || ""}-{dbFlats.find((f) => f.id === form.flat)?.flat_number || "selected flat"}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 text-sm">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Redirecting to Active Visitors…
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function FormField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div className="mt-1.5 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
      </div>
    </label>
  );
}
