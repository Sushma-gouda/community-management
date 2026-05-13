import { Building2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">Communa</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Apartment OS
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The operating system for modern residential communities. Built for residents,
              security, and administrators alike.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Roles", "Automation", "Pricing"] },
            { title: "Company", links: ["About", "Careers", "Contact", "Privacy"] },
          ].map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      className="text-sm text-foreground/80 hover:text-primary transition"
                      href="#"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Communa. All rights reserved.
          </div>
          <div className="flex gap-3">
            <Link to="/signin" className="text-xs text-foreground/80 hover:text-primary">
              Sign In
            </Link>
            <Link to="/signup" className="text-xs text-foreground/80 hover:text-primary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
