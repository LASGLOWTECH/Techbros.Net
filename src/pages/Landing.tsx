import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase, Zap, Shield, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";

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

export default function Landing() {
  return (
    <Layout showMobileNav={false}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(220 50% 15%) 100%)' }}>
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        
        {/* Animated shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />

        <div className="container relative z-10 px-4 py-20 text-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Nigeria's Premier Tech Talent Network
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Connect. Showcase.
              <br />
              <span className="text-accent">Get Hired.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-primary-foreground/80 mb-10">
              TechBros Network is the go-to platform for tech freelancers to showcase their 
              skills and for clients to discover exceptional talent.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "500+", label: "Freelancers" },
              { value: "100+", label: "Clients" },
              { value: "1K+", label: "Connections" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
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
                className="group p-6 rounded-2xl border border-white/10 card-hover"
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
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
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
      <footer className="py-12 border-t border-white/10" style={{ background: 'hsl(222 47% 6%)' }}>
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">TechBros Network</span>
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
