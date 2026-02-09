import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Loader2,
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
  const { userId } = useParams<{ userId: string }>();
  const [talent, setTalent] = useState<FreelancerWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [profileNotComplete, setProfileNotComplete] = useState(false);

  const { user, userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      // Check if current user is the profile owner
      setIsOwner(user?.id === userId);
      fetchTalent();
      if (user) checkBookmark();
    }
  }, [userId, user]);

  const fetchTalent = async () => {
    const { data, error } = await supabase
      .from("freelancer_profiles")
      .select(`
        user_id,
        role_title,
        bio,
        skills,
        availability,
        location,
        project_link,
        portfolio_images,
        is_public,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching talent:", error);
      setLoading(false);
      return;
    }

    // No freelancer profile exists yet
    if (!data) {
      // Check if this is the owner viewing their own profile
      if (user?.id === userId) {
        setProfileNotComplete(true);
      }
      setLoading(false);
      return;
    }

    const formatted: FreelancerWithProfile = {
      user_id: data.user_id,
      full_name: (data.profiles as any).full_name,
      avatar_url: (data.profiles as any).avatar_url,
      role_title: data.role_title,
      bio: data.bio,
      skills: data.skills || [],
      availability: data.availability || "available",
      location: data.location,
      project_link: data.project_link,
      portfolio_images: data.portfolio_images || [],
      is_public: data.is_public,
    };

    setTalent(formatted);
    setLoading(false);
  };

  const checkBookmark = async () => {
    if (!user || !userId) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("freelancer_id", userId)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to bookmark profiles.",
      });
      return;
    }

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("freelancer_id", userId);
      
      setIsBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, freelancer_id: userId });
      
      setIsBookmarked(true);
      toast({ title: "Profile bookmarked!" });
    }
  };

  const shareProfile = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${talent?.full_name} - TechBros Network`,
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Profile link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <Layout>
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
        <Layout>
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
      <Layout>
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

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>

        {/* Profile Header */}
        <div className="rounded-2xl border border-white/10 shadow-card p-6 sm:p-8 mb-6 animate-slide-up" style={{ background: 'hsl(220 41% 14%)' }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={talent.avatar_url || undefined} alt={talent.full_name} />
              <AvatarFallback className="gradient-hero text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {talent.full_name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("w-fit", availabilityColors[talent.availability])}
                >
                  {availabilityLabels[talent.availability]}
                </Badge>
              </div>

              {talent.role_title && (
                <p className="text-lg text-muted-foreground mb-3">
                  {talent.role_title}
                </p>
              )}

              {talent.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  {talent.location}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {talent.project_link && (
                  <a
                    href={talent.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </a>
                )}
                <Button variant="outline" onClick={shareProfile}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {userRole === "client" && (
                  <Button variant="ghost" onClick={toggleBookmark}>
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {talent.bio && (
          <div className="rounded-2xl border border-white/10 shadow-card p-6 sm:p-8 mb-6" style={{ background: 'hsl(220 41% 14%)' }}>
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{talent.bio}</p>
          </div>
        )}

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 && (
          <div className="rounded-2xl border border-white/10 shadow-card p-6 sm:p-8 mb-6" style={{ background: 'hsl(220 41% 14%)' }}>
            <h2 className="text-lg font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {talent.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {talent.portfolio_images && talent.portfolio_images.length > 0 && (
          <div className="rounded-2xl border border-white/10 shadow-card p-6 sm:p-8" style={{ background: 'hsl(220 41% 14%)' }}>
            <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {talent.portfolio_images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-video rounded-xl overflow-hidden bg-muted"
                >
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
