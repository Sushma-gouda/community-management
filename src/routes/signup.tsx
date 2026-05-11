import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, PasswordField, PrimaryButton, type Role } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — Communa" }] }),
  component: SignUp,
});

const blocks = ["Block A", "Block B", "Block C", "Block D"];
const flats = Array.from({ length: 12 }, (_, i) => `${101 + i}`);

function Select({ label, options, required }: { label: string; options: string[]; required?: boolean }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground/80 mb-1.5">
        {label}{required && <span className="text-destructive"> *</span>}
      </div>
      <select
        required={required}
        className="w-full h-11 px-3 rounded-lg border border-input bg-background/50 text-sm
          focus:outline-none focus:ring-2 focus:ring-ring transition"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function SignUp() {
  const [role, setRole] = useState<Role>("resident");
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = role === "admin" ? "/dashboard/admin" : role === "security" ? "/dashboard/security" : "/dashboard/resident";
    navigate({ to: dest });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your community in under a minute"
      role={role}
      onRole={setRole}
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {role === "resident" && (
          <>
            <Field label="Full name" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" type="email" required />
              <Field label="Phone" type="tel" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Block" options={blocks} required />
              <Select label="Flat" options={flats} required />
            </div>
            <Field label="Family members" type="number" required hint="Number of people in your household" />
            <PasswordField required />
          </>
        )}
        {role !== "resident" && (
          <>
            <Field label="Email" type="email" required />
            <PasswordField required />
            <PasswordField label="Confirm password" required />
            <p className="text-[11px] text-muted-foreground">
              {role === "admin" ? "Admin accounts require approval from your community owner." :
                "Security accounts must be added by an administrator first."}
            </p>
          </>
        )}
        <PrimaryButton>Create Account</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
