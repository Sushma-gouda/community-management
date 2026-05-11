import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, PasswordField, PrimaryButton, type Role } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Communa" }] }),
  component: SignIn,
});

function SignIn() {
  const [role, setRole] = useState<Role>("resident");
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = role === "admin" ? "/dashboard/admin" : role === "security" ? "/dashboard/security" : "/dashboard/resident";
    navigate({ to: dest });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your community workspace"
      role={role}
      onRole={setRole}
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Create account</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Email" type="email" required />
        <PasswordField required />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            <input type="checkbox" className="h-4 w-4 rounded border-input accent-[color:var(--primary)]" />
            Remember me
          </label>
          <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
        </div>
        <PrimaryButton>Sign In</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
