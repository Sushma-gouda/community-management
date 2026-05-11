import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell, Building2, ChevronDown, LogOut, Menu, Moon, Search, Sun, X,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };

export function DashboardLayout({
  role, items, children,
}: { role: "Admin" | "Resident" | "Security"; items: NavItem[]; children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Background mesh */}
      <div className="fixed inset-0 -z-10 gradient-mesh opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-72 shrink-0 transform transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full m-3 lg:m-4 rounded-2xl glass-strong shadow-card flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-5 flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Communa</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{role}</div>
              </div>
            </Link>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 rounded-md hover:bg-foreground/5">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {items.map((it) => {
              const active = path === it.to;
              return (
                <Link
                  key={it.to + it.label}
                  to={it.to}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-[image:var(--gradient-primary)] text-white shadow-elegant"
                      : "text-foreground/75 hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  <it.icon className="h-4 w-4 shrink-0" />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-white text-sm font-semibold shrink-0">
                {role[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{role} User</div>
                <div className="text-[11px] text-muted-foreground truncate">{role.toLowerCase()}@communa.app</div>
              </div>
              <button
                onClick={() => navigate({ to: "/" })}
                className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 min-w-0 lg:ml-[calc(18rem+2rem)] flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 px-3 lg:px-4 pt-3 lg:pt-4 shrink-0">
          <div className="rounded-2xl glass-strong shadow-card px-4 sm:px-5 py-3 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-foreground/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search…"
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-foreground/5 border border-transparent focus:bg-background focus:border-input focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="grid place-items-center h-9 w-9 rounded-lg hover:bg-foreground/5 text-foreground/80"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications */}
              <button className="relative grid place-items-center h-9 w-9 rounded-lg hover:bg-foreground/5 text-foreground/80">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-lg hover:bg-foreground/5"
                >
                  <div className="h-6 w-6 rounded-full bg-[image:var(--gradient-primary)] grid place-items-center text-white text-[11px] font-semibold">
                    {role[0]}
                  </div>
                  <span className="text-sm">{role}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl glass-strong shadow-elegant z-20 p-1.5 animate-scale-in">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <div className="text-sm font-medium">{role} User</div>
                        <div className="text-[11px] text-muted-foreground">{role.toLowerCase()}@communa.app</div>
                      </div>
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-foreground/5 text-left">
                        Profile Settings
                      </button>
                      <button
                        onClick={() => navigate({ to: "/" })}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-3 lg:px-4 py-5 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label, value, change, icon: Icon, tone = "primary",
}: {
  label: string; value: string; change?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "accent";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <div className="rounded-2xl glass shadow-card p-5 hover:shadow-elegant transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          {change && <div className="mt-1 text-xs text-[color:var(--success)] font-medium">{change}</div>}
        </div>
        <div className={cn("grid place-items-center h-10 w-10 rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl glass shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Badge({
  children, tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "muted" | "accent";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    danger: "bg-destructive/15 text-destructive",
    muted: "bg-foreground/5 text-foreground/70",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium", toneMap[tone])}>
      {children}
    </span>
  );
}
