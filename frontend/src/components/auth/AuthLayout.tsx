import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Crown, Eye, EyeOff, Home, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import hero from "@/assets/hero-1.jpg";

export type Role = "admin" | "resident" | "security";

const roles: { id: Role; label: string; icon: typeof Crown; desc: string }[] = [
  { id: "admin", label: "Administrator", icon: Crown, desc: "Manage your community" },
  { id: "resident", label: "Resident", icon: Home, desc: "Access your apartment" },
  { id: "security", label: "Security", icon: Shield, desc: "Operate gate & visitors" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  role,
  onRole,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  role: Role;
  onRole: (r: Role) => void;
}) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Visual side */}
      <div className="relative hidden lg:block overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.2_0.05_265)]/85 via-[oklch(0.3_0.1_280)]/65 to-[oklch(0.4_0.15_300)]/75" />
        <div className="absolute inset-0 gradient-mesh opacity-50 mix-blend-overlay" />
        <div className="relative z-10 h-full flex flex-col p-12 text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Communa</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                Apartment OS
              </div>
            </div>
          </Link>
          <div className="mt-auto max-w-md">
            <h2 className="text-4xl font-semibold leading-tight">
              The community OS that <span className="text-gradient">just works</span>.
            </h2>
            <p className="mt-4 text-white/75">
              Trusted by 120+ communities to manage residents, visitors, billing and security in one
              place.
            </p>
            <div className="mt-8 flex gap-6 text-white/80 text-sm">
              <div>
                <div className="text-2xl font-semibold text-white">10k+</div>Residents
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">99.99%</div>Uptime
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">4.9★</div>App rating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="absolute inset-0 -z-10 gradient-mesh opacity-40" />
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)]">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm font-semibold">Communa</div>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>

          {/* Role selector */}
          <div className="mt-7 grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onRole(r.id)}
                className={cn(
                  "group relative rounded-xl p-3 text-left transition-all border",
                  role === r.id
                    ? "border-primary bg-primary/5 shadow-elegant"
                    : "border-border bg-card hover:border-foreground/20",
                )}
              >
                <div
                  className={cn(
                    "grid place-items-center h-8 w-8 rounded-lg mb-2",
                    role === r.id
                      ? "bg-[image:var(--gradient-primary)] text-white"
                      : "bg-secondary text-foreground/70",
                  )}
                >
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-semibold">{r.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {r.desc}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">{children}</div>
          <div className="mt-6">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  required,
  children,
  hint,
  name,
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  autoComplete,
}: {
  label: string;
  type?: string;
  required?: boolean;
  children?: ReactNode;
  hint?: string;
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <div className="text-xs font-medium text-foreground/80 mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </div>
      {children ?? (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full h-11 px-3.5 rounded-lg border border-input bg-background/50 text-sm
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
      )}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

export function PasswordField({
  label = "Password",
  required,
  name = "password",
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  autoComplete,
}: {
  label?: string;
  required?: boolean;
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block" htmlFor={id}>
      <div className="text-xs font-medium text-foreground/80 mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-input bg-background/50 text-sm
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label="Toggle password visibility"
          className="absolute inset-y-0 right-0 grid place-items-center w-11 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  loading,
  loadingLabel = "Please wait…",
}: {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full h-11 rounded-lg bg-[image:var(--gradient-primary)] text-white text-sm font-medium
        shadow-elegant hover:shadow-glow transition-all
        disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
