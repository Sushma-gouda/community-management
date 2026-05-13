import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthLayout,
  Field,
  PasswordField,
  PrimaryButton,
  type Role,
} from "@/components/auth/AuthLayout";
import { supabase, isSupabaseConfigured } from "@/services/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";
import { useAuth } from "@/context/AuthContext";
import {
  dashboardPathForRole,
  getPostAuthRedirectPath,
  resolveUserRole,
  type AppRole,
} from "@/lib/auth-roles";

type SigninSearch = { next?: string };

function roleTabLabel(r: AppRole): string {
  switch (r) {
    case "admin":
      return "Administrator";
    case "security":
      return "Security";
    default:
      return "Resident";
  }
}

function isAllowedDashboardNext(next: string, home: string): boolean {
  return next === home || next.startsWith(`${home}/`);
}

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — Communa" }] }),
  validateSearch: (raw: Record<string, unknown>): SigninSearch => ({
    next:
      typeof raw.next === "string" && raw.next.startsWith("/") && !raw.next.startsWith("//")
        ? raw.next
        : undefined,
  }),
  component: SignIn,
});

function SignIn() {
  const [role, setRole] = useState<Role>("resident");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { user, profile, initialized } = useAuth();

  if (initialized && user) {
    const dest = dashboardPathForRole(profile?.role || "resident");
    const target = next?.startsWith("/dashboard") && isAllowedDashboardNext(next, dest) ? next : dest;
    return <Navigate to={target} />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.",
      );
      return;
    }

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !data.user) {
        setError(formatAuthError(authError, "signin"));
        return;
      }

      const accountRole = await resolveUserRole(data.user);
      const dest = dashboardPathForRole(accountRole);
      const selectedPath = dashboardPathForRole(role as AppRole);

      if (dest !== selectedPath) {
        await supabase.auth.signOut();
        setError(
          `This account is registered as ${roleTabLabel(accountRole)}. Select "${roleTabLabel(accountRole)}" above, then sign in again.`,
        );
        return;
      }

      if (next?.startsWith("/dashboard")) {
        if (!isAllowedDashboardNext(next, dest)) {
          navigate({ to: dest });
          return;
        }
        navigate({ to: next });
        return;
      }
      navigate({ to: dest });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your community workspace"
      role={role}
      onRole={setRole}
      footer={
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Create account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {error && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}
        <Field
          label="Email"
          type="email"
          name="email"
          id="signin-email"
          required
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={loading}
        />
        <PasswordField
          required
          name="password"
          id="signin-password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-[color:var(--primary)]"
            />
            Remember me
          </label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <PrimaryButton loading={loading} loadingLabel="Signing in…">
          Sign In
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
