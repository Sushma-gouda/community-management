import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Roles } from "@/components/landing/Roles";
import { Automation } from "@/components/landing/Automation";
import { WhyUs } from "@/components/landing/WhyUs";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Communa — Community Apartment Management System" },
      { name: "description", content: "Complete digital platform for apartment residents, security, and administrators to manage daily community operations." },
      { property: "og:title", content: "Communa — Community Apartment Management System" },
      { property: "og:description", content: "Modern, secure and beautiful apartment management for residents, security and admins." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Roles />
        <Automation />
        <WhyUs />
      </main>
      <Footer />
    </div>
  );
}
