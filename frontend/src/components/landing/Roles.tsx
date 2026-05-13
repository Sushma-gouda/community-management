import { Crown, Home, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

const roles = [
  {
    icon: Crown,
    title: "Administrators",
    color: "from-[oklch(0.7_0.18_295)] to-[oklch(0.55_0.19_265)]",
    points: [
      "Full community oversight",
      "Billing & finance reports",
      "Approve residents & staff",
      "Configure rules & policies",
    ],
  },
  {
    icon: Home,
    title: "Residents",
    color: "from-[oklch(0.7_0.17_195)] to-[oklch(0.55_0.19_265)]",
    points: [
      "Pay dues online",
      "Pre-approve visitors",
      "Raise complaints with photos",
      "Read notices & vote in polls",
    ],
  },
  {
    icon: Shield,
    title: "Security",
    color: "from-[oklch(0.78_0.16_75)] to-[oklch(0.6_0.22_25)]",
    points: [
      "Visitor check-in & OTP",
      "Vehicle entry logs",
      "Emergency SOS alerts",
      "Patrol & shift tracking",
    ],
  },
];

export function Roles() {
  return (
    <section id="roles" className="py-28 px-4 sm:px-6 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium">
            Role-based Access
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight">
            Tailored for <span className="text-gradient">every role</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Three powerful workspaces, one seamless platform — each interface designed for the
            people who use it.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.title}
              className="relative rounded-3xl glass shadow-card p-8 group overflow-hidden"
            >
              <div
                className={`absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br ${r.color} opacity-20 blur-3xl group-hover:opacity-40 transition`}
              />
              <div
                className={`grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br ${r.color} text-white shadow-elegant`}
              >
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{r.title}</h3>
              <ul className="mt-5 space-y-3">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="mt-7 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Open workspace →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
