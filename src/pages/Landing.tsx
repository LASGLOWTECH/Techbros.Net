import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase, Shield, Globe, Sparkles, Code2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import logo from "@/assets/logo.png";

const features = [
  {
    icon: Users,
    title: "Verified Tech Talent",
    description: "Connect with skilled freelancers across UI/UX, Development, DevOps, and more.",
  },
  {
    icon: Briefcase,
    title: "Showcase Your Work",
    description: "Build a stunning portfolio without needing a personal website.",
  },
  {
    icon: Sparkles,
    title: "Quick Connections",
    description: "Find and connect with the right talent or clients in minutes.",
  },
  {
    icon: Shield,
    title: "Trusted Network",
    description: "A curated community of professionals you can rely on.",
  },
  {
    icon: Globe,
    title: "Work Remotely",
    description: "Collaborate with talents and clients from anywhere in the world.",
  },
  {
    icon: Sparkles,
    title: "Stand Out",
    description: "Professional profiles that help you get noticed by top companies.",
  },
];

export default function Landing() {
  return (
    <Layout showMobileNav={false}>
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(220 50% 8%) 100%)'
        }}>
          {/* Subtle vertical lines texture like reference */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, hsl(0 0% 100%) 0px, hsl(0 0% 100%) 1px, transparent 1px, transparent 40px)',
          }} />
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_53%_/_0.08),_transparent_70%)]" />
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,_hsl(217_91%_53%_/_0.12),_transparent_70%)]" />
        </div>

        {/* Desktop layout - centered like reference */}
        <div className="container relative z-10 px-6 sm:px-8 lg:px-12 hidden md:flex items-center justify-center min-h-[100vh]">
          <div className="max-w-4xl text-center">
            <div className="animate-slide-up space-y-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                Connect & Showcase.{" "}
                <span className="text-gradient">Get Hired.</span>
              </h1>

              <p className="max-w-2xl mx-auto text-lg lg:text-xl text-muted-foreground leading-relaxed">
                The go-to platform for tech freelancers to showcase their
                skills and for clients to discover exceptional talent across Africa.
              </p>

              <div className="flex items-center justify-center gap-4 pt-4">
                <Link to="/explore">
                  <Button variant="accent" size="xl" className="group rounded-full min-w-[220px]">
                    Explore Talents
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="heroOutline" size="xl" className="rounded-full min-w-[200px]">
                    Start Your Journey
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout - centered, simple */}
        <div className="container relative z-10 px-6 md:hidden">
          <div className="min-h-[100vh] flex flex-col items-center justify-center text-center">
            <div className="animate-slide-up space-y-8 w-full max-w-sm">
              {/* Logo */}
              <div className="flex justify-center">
                <img src={logo} alt="TechBros Network" className="h-16 w-16 rounded-2xl" />
              </div>

              <h1 className="text-3xl font-bold text-foreground leading-tight">
                TechBros <span className="text-gradient">Network</span>
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed px-2">
                The exclusive hub where tech elite showcase skills and startups discover magic.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/50 p-4 flex flex-col items-center gap-2" style={{ background: 'hsl(220 41% 14% / 0.6)' }}>
                  <Code2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Portfolios</span>
                  <span className="text-xs text-muted-foreground text-center">High-impact profile generation</span>
                </div>
                <div className="rounded-2xl border border-border/50 p-4 flex flex-col items-center gap-2" style={{ background: 'hsl(220 41% 14% / 0.6)' }}>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Verified</span>
                  <span className="text-xs text-muted-foreground text-center">Vetted tech talent pool</span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 w-full pt-2">
                <Link to="/signup" className="w-full">
                  <Button variant="accent" size="lg" className="w-full group rounded-xl">
                    Get Started
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full">
                  <Button variant="heroOutline" size="lg" className="w-full rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, hsl(222 47% 8%) 0%, hsl(220 50% 11%) 100%)' }}>
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">TechBros Network?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built a platform that empowers tech professionals and connects them with opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border/50 card-hover"
                style={{ background: 'hsl(220 41% 14%)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-glow mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30" style={{ background: 'hsl(222 47% 6%)' }}>
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="TechBros Network" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-foreground">TechBros Network v 1.0 </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechBros Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
