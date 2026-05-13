import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import { cn } from "@/lib/utils";

const slides = [hero1, hero2, hero3, hero4];

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Slideshow */}
      <div className="absolute inset-0">
        {slides.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            width={1920}
            height={1080}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-in-out will-change-[opacity,transform]",
              active === i ? "opacity-100 scale-105" : "opacity-0 scale-100",
            )}
            style={{ transitionProperty: "opacity, transform" }}
          />
        ))}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_100%)]" />
        <div
          className="absolute inset-0 opacity-60 mix-blend-overlay"
          style={{ background: "var(--gradient-mesh)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center pt-24 pb-20">
          <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-medium text-white/90 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-[oklch(0.78_0.17_305)]" />
            The all-in-one community OS · Trusted by modern societies
          </div>

          <h1
            className="mt-6 text-balance font-display font-semibold tracking-tight text-white animate-fade-up
            text-[clamp(2rem,5vw,3.5rem)] leading-[1.1]"
          >
            Community Apartment <br className="hidden sm:block" />
            <span className="text-gradient">Management System</span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-xl text-pretty text-white/75 text-base sm:text-lg leading-relaxed animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            A complete digital platform for apartment residents, security, and administrators to
            manage daily community operations efficiently.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              to="/signin"
              className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-7 text-sm font-medium text-white shadow-elegant hover:shadow-glow transition-all"
            >
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl glass-dark px-7 text-sm font-medium text-white hover:bg-white/15 transition-all"
            >
              Create Account
            </Link>
          </div>

          <div
            className="mt-10 flex items-center justify-center gap-6 text-xs text-white/60 animate-fade-up"
            style={{ animationDelay: "360ms" }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[oklch(0.75_0.17_155)]" />
              SOC 2 ready
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div>10,000+ residents managed</div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div>99.99% uptime</div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              active === i ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
