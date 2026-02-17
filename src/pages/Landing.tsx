import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase, Zap, Shield, Globe, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import heroImage from "@/assets/hero-tech-person.png";

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
      {/* Hero Section - Spline-inspired split layout */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(220 50% 15%) 100%)' }}>
        {/* Ambient glow effects */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(ellipse_at_center_right,_hsl(217_91%_53%_/_0.15),_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_bottom_left,_hsl(217_91%_53%_/_0.1),_transparent_60%)]" />
        
        {/* Floating grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative z-10 px-4 py-12 md:py-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[85vh]">
            {/* Left - Content */}
            <div className="animate-slide-up order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-sm font-medium text-primary mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                Nigeria's Premier Tech Talent Network
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
                Connect.
                <br />
                Showcase.
                <br />
                <span className="text-gradient">Get Hired.</span>
              </h1>
              
              <p className="max-w-lg text-lg text-muted-foreground mb-10 leading-relaxed">
                The go-to platform for tech freelancers to showcase their 
                skills and for clients to discover exceptional talent across Africa.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
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
              <div className="flex items-center gap-8 pt-6 border-t border-border/50">
                {[
                  { value: "500+", label: "Freelancers" },
                  { value: "100+", label: "Clients" },
                  { value: "1K+", label: "Connections" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center">
              {/* Glow behind image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] rounded-full bg-primary/20 blur-[100px]" />
              </div>
              
              {/* Main image */}
              <div className="relative z-10 w-full max-w-[500px] lg:max-w-[550px]">
                <img 
                  src={heroImage} 
                  alt="Tech professional working with floating code interfaces"
                  className="w-full h-auto object-contain drop-shadow-2xl animate-float"
                  loading="eager"
                />
              </div>

              {/* Floating badge cards */}
              <div className="absolute top-[15%] right-[5%] lg:right-0 z-20 glass rounded-xl px-4 py-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">New Jobs</div>
                    <div className="text-sm font-semibold text-foreground">+24 today</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-[20%] left-[0%] lg:left-[-5%] z-20 glass rounded-xl px-4 py-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--success)_/_0.2)] flex items-center justify-center">
                    <Users className="h-4 w-4 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Active Talents</div>
                    <div className="text-sm font-semibold text-foreground">500+ online</div>
                  </div>
                </div>
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
