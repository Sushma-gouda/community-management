import { Award, Lock, Rocket, Smile } from "lucide-react";

const reasons = [
  { icon: Lock, title: "Bank-grade security", desc: "End-to-end encryption, role-based access, and audited infrastructure." },
  { icon: Rocket, title: "Set up in minutes", desc: "Import residents from a CSV — your community is live the same day." },
  { icon: Smile, title: "Loved by residents", desc: "Beautiful mobile-first apps that grandparents and Gen-Z both adore." },
  { icon: Award, title: "Built with operators", desc: "Designed alongside committees managing 50 to 5,000 unit communities." },
];

export function WhyUs() {
  return (
    <section id="why" className="py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-medium">
              Why Choose Us
            </div>
            <h2 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight">
              The platform your <br />
              <span className="text-gradient">society deserves</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-md">
              Move beyond outdated portals. Communa pairs serious infrastructure with delightful
              design — so every interaction feels effortless.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl glass shadow-card p-6 hover:shadow-glow transition-all duration-500">
                <div className="grid place-items-center h-11 w-11 rounded-xl bg-[image:var(--gradient-primary)] text-white">
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold">{r.title}</div>
                <div className="mt-1.5 text-sm text-muted-foreground">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl glass-strong shadow-card p-8">
          {[
            { k: "10,000+", v: "Residents" },
            { k: "120+", v: "Communities" },
            { k: "₹50Cr+", v: "Processed" },
            { k: "4.9★", v: "App rating" },
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="text-3xl sm:text-4xl font-semibold text-gradient">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
