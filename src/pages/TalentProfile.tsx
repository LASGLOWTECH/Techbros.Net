import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Loader2,
  Mail,
  Share2,
  Phone,
  Briefcase,
  GraduationCap,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { FreelancerWithProfile, AvailabilityStatus } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { UnlockContactButton } from "@/components/monetization/UnlockContactButton";
import { BuyCreditsModal } from "@/components/monetization/BuyCreditsModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const availabilityColors: Record<AvailabilityStatus, string> = {
  available: "bg-success/10 text-success border-success/20",
  busy: "bg-warning/10 text-warning border-warning/20",
  unavailable: "bg-muted text-muted-foreground border-muted",
};

const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "Available for Work",
  busy: "Currently Busy",
  unavailable: "Not Available",
};

export default function TalentProfile() {
  const { id } = useParams<{ id: string }>();
  const [talent, setTalent] = useState<FreelancerWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [profileNotComplete, setProfileNotComplete] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { user, userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) fetchTalent();
  }, [id]);

  useEffect(() => {
    if (user && talent) checkBookmark();
  }, [user, talent]);

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const slugToDisplayName = (slug?: string | null) => {
    if (!slug) return null;
    const trimmed = slug.replace(/-[0-9a-f]{6}(?:-\d+)?$/i, "");
    const parts = trimmed.split("-").filter(Boolean);
    if (parts.length === 0) return null;
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  };

  const fetchTalent = async () => {
    const lookupKey = id?.trim();
    if (!lookupKey) {
      setLoading(false);
      return;
    }

    const query = supabase
      .from("freelancer_profiles")
      .select(`
        user_id,
        role_title,
        bio,
        about_long,
        skills,
        skill_summary,
        availability,
        location,
        contact_location,
        contact_email,
        contact_phone,
        contact_whatsapp,
        project_link,
        cv_url,
        portfolio_images,
        services,
        experiences,
        projects,
        awards,
        certifications,
        social_links,
        hero_intro,
        hero_subtitle,
        hero_tagline,
        slug,
        is_public,
        profiles (
          full_name,
          avatar_url,
          email
        )
      `)
      .maybeSingle();

    const { data, error } = isUuid(lookupKey)
      ? await query.eq("user_id", lookupKey)
      : await query.eq("slug", lookupKey.toLowerCase());

    if (error) {
      console.error("Error fetching talent:", error);
      setLoading(false);
      return;
    }

    // No freelancer profile exists yet
    if (!data) {
      // Check if this is the owner viewing their own profile
      if (user?.id && isUuid(lookupKey) && user.id === lookupKey) {
        setProfileNotComplete(true);
      }
      setIsOwner(false);
      setLoading(false);
      return;
    }

    const profileRow = (data.profiles as any) || null;
    const fallbackName = slugToDisplayName(data.slug || (isUuid(lookupKey) ? null : lookupKey));
    const formatted: FreelancerWithProfile = {
      user_id: data.user_id,
      full_name: profileRow?.full_name || fallbackName || "Freelancer",
      email: profileRow?.email || null,
      avatar_url: profileRow?.avatar_url || null,
      role_title: data.role_title,
      bio: data.bio,
      about_long: data.about_long,
      skills: data.skills || [],
      skill_summary: data.skill_summary,
      availability: data.availability || "available",
      location: data.location,
      contact_location: data.contact_location,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      contact_whatsapp: data.contact_whatsapp,
      project_link: data.project_link,
      cv_url: data.cv_url,
      portfolio_images: data.portfolio_images || [],
      services: (data.services as any) || [],
      experiences: (data.experiences as any) || [],
      projects: (data.projects as any) || [],
      awards: (data.awards as any) || [],
      certifications: (data.certifications as any) || [],
      social_links: (data.social_links as any) || [],
      hero_intro: data.hero_intro,
      hero_subtitle: data.hero_subtitle,
      hero_tagline: data.hero_tagline,
      slug: data.slug,
      is_public: data.is_public,
    };

    setTalent(formatted);
    setIsOwner(user?.id === data.user_id);
    setLoading(false);
  };

  const checkBookmark = async () => {
    if (!user || !talent?.user_id) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("freelancer_id", talent.user_id)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user || !talent?.user_id) {
      if (!user) toast({ title: "Please sign in", description: "You need to be logged in to bookmark profiles." });
      return;
    }

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("freelancer_id", talent.user_id);
      setIsBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, freelancer_id: talent.user_id });
      
      setIsBookmarked(true);
      toast({ title: "Profile bookmarked!" });
    }
  };

  const shareProfile = async () => {
    const shareUrl = talent?.slug
      ? `${window.location.origin}/talent/${talent.slug}`
      : `${window.location.origin}/talent/${talent?.user_id || ""}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${talent?.full_name} - TechBros Network`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Profile link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <Layout showMobileNav={false} hideNav>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!talent) {
    // Owner hasn't completed their profile yet
    if (profileNotComplete && isOwner) {
      return (
        <Layout showMobileNav={false} hideNav>
          <div className="container px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Your profile is not yet complete</h1>
            <p className="text-muted-foreground mb-6">
              Please save your profile before previewing. Add your role title, bio, and skills to get started.
            </p>
            <Link to="/freelancer/profile">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Complete Your Profile
              </Button>
            </Link>
          </div>
        </Layout>
      );
    }

    // Profile truly doesn't exist for other users
    return (
      <Layout showMobileNav={false} hideNav>
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-muted-foreground mb-6">
            This talent profile doesn't exist or is not public.
          </p>
          <Link to="/explore">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const initials = talent.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  // Use short intro only (reference: "Hi, I'm"); avoid long/custom text that might include another name
  const heroIntro = (talent.hero_intro?.trim().length && talent.hero_intro.trim().length <= 20)
    ? talent.hero_intro.trim()
    : "Hi, I'm";
  const heroSubtitle = talent.hero_subtitle || talent.role_title || "Freelancer";
  const heroTagline = talent.hero_tagline || "I craft standout digital experiences that help teams move faster.";
  const heroBio = talent.bio?.trim() || heroTagline;
  const aboutText = talent.about_long || talent.bio;
  const services = talent.services || [];
  const experiences = talent.experiences || [];
  const projects = talent.projects || [];
  const awards = talent.awards || [];
  const certifications = talent.certifications || [];
  const socialLinks = talent.social_links || [];
  const contactEmail = talent.contact_email || talent.email;
  const contactLocation = talent.contact_location || talent.location;

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#skills", label: "Skills" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Portfolio" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <Layout showMobileNav={false} hideNav>
      <div className="min-h-screen bg-background">
        {/* Sticky portfolio nav — Share left, nav right; mobile menu via Sheet */}
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-fade-in-up transition-shadow duration-300">
          <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={shareProfile}>
                <Share2 className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Share</span>
              </Button>
              {userRole === "client" && (
                <Button variant="ghost" size="sm" onClick={toggleBookmark}>
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  <span className="hidden md:inline ml-1">{isBookmarked ? "Saved" : "Save"}</span>
                </Button>
              )}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <div className="flex flex-col gap-4 pt-6">
                    {navLinks.map(({ href, label }) => (
                      <a
                        key={href}
                        href={href}
                        onClick={() => setMobileNavOpen(false)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Hero — on mobile image is first and centered; on lg text left, image right; Landing-style lines/pattern */}
        <section id="hero" className="scroll-mt-14 relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(220 50% 8%) 100%)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(0 0% 100%) 0px, hsl(0 0% 100%) 1px, transparent 1px, transparent 40px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_53%_/_0.08),_transparent_70%)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_bottom,_hsl(217_91%_53%_/_0.12),_transparent_70%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-10 sm:py-20 md:px-14 md:py-24 lg:px-16 xl:px-20">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4 min-w-0 order-2 lg:order-1 text-center lg:text-left">
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground opacity-0 animate-fade-in-up-delay-1">{heroIntro}</p>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl opacity-0 animate-fade-in-up-delay-2">
                  {talent.full_name}
                </h1>
                <p className="text-xl text-muted-foreground opacity-0 animate-fade-in-up-delay-3">{heroSubtitle}</p>
                <p className="text-base text-muted-foreground max-w-xl leading-relaxed opacity-0 animate-fade-in-up-delay-4 mx-auto lg:mx-0">{heroBio}</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 opacity-0 animate-fade-in-up-delay-5">
                  <Badge variant="outline" className={cn("text-xs", availabilityColors[talent.availability])}>
                    {availabilityLabels[talent.availability]}
                  </Badge>
                  {talent.location && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {talent.location}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-4 justify-center lg:justify-start">
                  {talent.cv_url && (
                    <a href={talent.cv_url} target="_blank" rel="noopener noreferrer">
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Download CV
                      </Button>
                    </a>
                  )}
                  <a href="#contact">
                    <Button variant={talent.cv_url ? "outline" : "default"}>
                      <Mail className="h-4 w-4 mr-2" />
                      Get in Touch
                    </Button>
                  </a>
                  {userRole === "client" && (
                    <UnlockContactButton
                      expertId={talent.user_id}
                      expertName={talent.full_name}
                      roleTitle={talent.role_title}
                      onBuyCredits={() => setShowBuyCredits(true)}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-center lg:justify-end lg:pl-8 xl:pl-12 order-1 lg:order-2 w-full opacity-0 animate-fade-in-up">
                <div className="relative w-52 h-64 sm:w-56 sm:h-72 md:w-60 md:h-80 rounded-[50%] p-1.5 bg-primary/20 shadow-[0_0_0_1px_rgba(255,255,255,0.8),0_0_0_8px_hsl(var(--primary)/0.25)] overflow-hidden shrink-0 transition-transform duration-500 hover:scale-[1.02]">
                  <Avatar className="h-full w-full rounded-[50%] border-4 border-background object-cover shadow-xl">
                    <AvatarImage src={talent.avatar_url || undefined} alt={talent.full_name} className="object-cover h-full w-full aspect-auto" />
                    <AvatarFallback className="bg-primary/20 text-primary text-4xl md:text-5xl font-bold rounded-[50%] h-full w-full flex items-center justify-center">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        {aboutText && (
          <section id="about" className="scroll-mt-14 border-b border-border/50 bg-muted/30 opacity-0 animate-section-in">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-6 transition-all duration-300">About</h2>
              <p className="text-muted-foreground max-w-3xl leading-relaxed whitespace-pre-wrap">{aboutText}</p>
            </div>
          </section>
        )}

        {/* Portfolio / Projects — first after hero, like reference */}
        {(projects.length > 0 || (talent.portfolio_images?.length ?? 0) > 0) && (
          <section id="projects" className="scroll-mt-14 border-b border-border/50 bg-muted/30 opacity-0 animate-section-in-delay-2">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Projects</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl">What I have done for my clients. Swipe through previous projects to see the range of work accomplished.</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <div key={`p-${index}`} className="group overflow-hidden rounded-t-xl rounded-b-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    {project.image_url ? (
                      <div className="aspect-video overflow-hidden rounded-t-xl bg-muted border-b-2 border-primary">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center rounded-t-xl border-b-2 border-primary">
                        <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="p-4 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground">{project.title}</h3>
                        {project.category && (
                          <span className="shrink-0 text-xs text-muted-foreground uppercase tracking-wide">{project.category}</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block"
                        >
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            View Project
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {talent.portfolio_images?.map((image, index) => (
                  <div key={`img-${index}`} className="group overflow-hidden rounded-t-xl rounded-b-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-video overflow-hidden rounded-t-xl bg-muted border-b-2 border-primary">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-left">
                      <p className="text-sm text-muted-foreground">Portfolio work</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills — reference: "Accomplished Skills to Date" */}
        {(talent.skills?.length ?? 0) > 0 && (
          <section id="skills" className="scroll-mt-14 border-b border-border/50 opacity-0 animate-section-in-delay-3">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Skills</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">Accomplished skills to date.</p>
              {talent.skill_summary && (
                <p className="text-muted-foreground mb-4 max-w-2xl">{talent.skill_summary}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm py-2 px-4 font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services — reference: "What I Do for My Clients" */}
        {services.length > 0 && (
          <section id="services" className="scroll-mt-14 border-b border-border/50 bg-muted/30 opacity-0 animate-section-in-delay-4">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Services</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl">What I do for my clients.</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience — reference: "Demonstrated Work Experience" / Resume */}
        {experiences.length > 0 && (
          <section id="experience" className="scroll-mt-14 border-b border-border/50 opacity-0 animate-section-in-delay-5">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Resume</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl">Demonstrated work experience.</p>
              <div className="space-y-6">
                {experiences.map((item, index) => (
                  <div key={index} className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-lg">{item.role}</h3>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {item.start} – {item.end || "Present"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{item.company}</p>
                      {item.summary && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certifications & Awards */}
        {(certifications.length > 0 || awards.length > 0) && (
          <section className="scroll-mt-14 border-b border-border/50">
            <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
              <h2 className="text-2xl font-bold tracking-tight mb-8">Education & Recognition</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {certifications.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Certifications
                    </h3>
                    {certifications.map((cert, index) => (
                      <div key={index} className="rounded-xl border border-border bg-card p-4">
                        <p className="font-medium">{cert.title}</p>
                        <p className="text-sm text-muted-foreground">{cert.issuer}{cert.year ? ` · ${cert.year}` : ""}</p>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                            View credential <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {awards.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Awards</h3>
                    {awards.map((award, index) => (
                      <div key={index} className="rounded-xl border border-border bg-card p-4">
                        <p className="font-medium">{award.title}</p>
                        <p className="text-sm text-muted-foreground">{award.issuer}{award.year ? ` · ${award.year}` : ""}</p>
                        {award.description && <p className="mt-1 text-sm text-muted-foreground">{award.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-14 border-b border-border/50 bg-muted/30 opacity-0 animate-section-in-delay-6">
          <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16 xl:px-20">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Get in Touch</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">I can&apos;t wait to connect with you.</p>
            <div className="flex flex-wrap gap-6 text-sm">
              {contactLocation && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{contactLocation}</span>
                </div>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{contactEmail}</span>
                </a>
              )}
              {talent.contact_phone && (
                <a href={`tel:${talent.contact_phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{talent.contact_phone}</span>
                </a>
              )}
              {talent.contact_whatsapp && (
                <a href={talent.contact_whatsapp.startsWith("http") ? talent.contact_whatsapp : `https://wa.me/${talent.contact_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Hiring Inquiry - ${talent.role_title || "Freelancer"}`)}&body=${encodeURIComponent(`Hi ${talent.full_name},\n\nI came across your profile on TechBros Network and I'm interested in hiring you for a project.\n\nLooking forward to hearing from you!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Me
                  </Button>
                </a>
              )}
              {talent.project_link && (
                <a href={talent.project_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Portfolio
                  </Button>
                </a>
              )}
              {socialLinks.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    {link.label}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-muted/50">
          <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10 md:px-14 lg:px-16 xl:px-20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <Link to="/explore" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Explore
                </Link>
                <span>·</span>
                <span>{talent.full_name} · TechBros Network</span>
              </div>
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TechBros Network</p>
            </div>
          </div>
        </footer>
      </div>
      <BuyCreditsModal open={showBuyCredits} onOpenChange={setShowBuyCredits} />
    </Layout>
  );
}
