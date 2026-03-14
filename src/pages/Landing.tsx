import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase, Zap, Shield, Globe, Sparkles, Code2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import heroImage from "@/assets/hero-tech-landscape.png";

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
    icon: Zap,
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

const trustedBy = ["Google", "Meta", "Paystack", "Flutterwave", "Andela"];

export default function Landing() {
  return (
    <Layout showMobileNav={false}>
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Desktop: Full-screen background image */}
        <div className="absolute inset-0 hidden md:block">
          <img
            src={heroImage}
            alt="Tech professionals collaborating"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, hsl(222 47% 11% / 0.95) 0%, hsl(222 47% 11% / 0.85) 35%, hsl(222 47% 11% / 0.5) 65%, hsl(222 47% 11% / 0.3) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, hsl(222 47% 11%) 0%, transparent 30%)'
          }} />
          <div className="absolute inset-0 backdrop-blur-[2px]" style={{
            maskImage: 'linear-gradient(to right, black 0%, black 30%, transparent 60%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 30%, transparent 60%)'
          }} />
        </div>

        {/* Mobile: Simple dark background with glow */}
        <div className="absolute inset-0 md:hidden" style={{
          background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(220 50% 8%) 100%)'
        }}>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_53%_/_0.12),_transparent_70%)]" />
        </div>

        {/* Ambient glow - desktop only */}
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-[radial-gradient(ellipse_at_bottom_left,_hsl(217_91%_53%_/_0.15),_transparent_60%)] hidden md:block" />

        {/* Desktop layout */}
        <div className="container relative z-10 px-6 sm:px-8 lg:px-12 py-20 md:py-0 hidden md:block">
          <div className="max-w-2xl min-h-[85vh] flex flex-col justify-center">
            <div className="animate-slide-up space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Nigeria's Premier Tech Talent Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                Connect & Showcase.{" "}
                <span className="text-gradient">Get Hired.</span>
              </h1>

              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                The go-to platform for tech freelancers to showcase their
                skills and for clients to discover exceptional talent across Africa.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link to="/signup?role=freelancer">
                  <Button variant="accent" size="xl" className="group min-w-[200px]">
                    Join as Freelancer
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/signup?role=client">
                  <Button variant="heroOutline" size="xl" className="min-w-[200px]">
                    Hire Talent
                  </Button>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-10 pt-8 border-t border-border/50">
                {[
                  { value: "500+", label: "Freelancers" },
                  { value: "100+", label: "Clients" },
                  { value: "1K+", label: "Connections" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout - centered, simple like reference */}
        <div className="container relative z-10 px-6 md:hidden">
          <div className="min-h-[100vh] flex flex-col items-center justify-center text-center">
            <div className="animate-slide-up space-y-8 w-full max-w-sm">
              {/* Logo icon */}
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                TechBros <span className="text-gradient">Network</span>
              </h1>

              {/* Subtitle */}
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

      {/* Trusted By Strip */}
      <section className="py-8 border-y border-border/30" style={{ background: 'hsl(222 47% 8%)' }}>
        <div className="container px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Trusted by teams at</span>
            {trustedBy.map((name) => (
              <span key={name} className="text-lg font-semibold text-muted-foreground/50 tracking-wide">{name}</span>
            ))}
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(220 50% 10%) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent" />
        
        <div className="container relative z-10 px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of tech professionals already using TechBros Network to grow their careers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/explore">
              <Button variant="accent" size="lg">
                Explore Talents
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="heroOutline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/30" style={{ background: 'hsl(222 47% 6%)' }}>
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">TechBros Network</span>
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
