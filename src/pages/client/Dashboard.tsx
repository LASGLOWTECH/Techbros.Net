import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bookmark, Loader2, Settings, Building2, Briefcase } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { TalentCard } from "@/components/talent/TalentCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { FreelancerWithProfile } from "@/lib/supabase";

export default function ClientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedTalents, setBookmarkedTalents] = useState<FreelancerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      fetchBookmarks();
      fetchJobCount();
    }
  }, [user, authLoading]);

  const fetchBookmarks = async () => {
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("freelancer_id")
      .eq("user_id", user!.id);

    if (!bookmarks?.length) {
      setLoading(false);
      return;
    }

    const ids = bookmarks.map(b => b.freelancer_id);
    const { data } = await supabase
      .from("freelancer_profiles")
      .select(`user_id, role_title, bio, skills, availability, location, project_link, portfolio_images, is_public, profiles(full_name, email, avatar_url)`)
      .in("user_id", ids);

    const formatted = (data || []).map((item: any) => ({
      user_id: item.user_id,
      full_name: item.profiles.full_name,
      email: item.profiles.email,
      avatar_url: item.profiles.avatar_url,
      role_title: item.role_title,
      bio: item.bio,
      skills: item.skills || [],
      availability: item.availability || "available",
      location: item.location,
      project_link: item.project_link,
      portfolio_images: item.portfolio_images || [],
      is_public: item.is_public,
    }));

    setBookmarkedTalents(formatted);
    setLoading(false);
  };

  const fetchJobCount = async () => {
    const { data: profile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (profile) {
      const { count } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("client_id", profile.id);
      setJobCount(count || 0);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link to="/explore" className="rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all bg-card">
            <Search className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Explore Talents</h3>
            <p className="text-sm text-muted-foreground">Find skilled professionals</p>
          </Link>
          <div className="rounded-xl border border-border p-5 bg-card">
            <Bookmark className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Saved Talents</h3>
            <p className="text-sm text-muted-foreground">{bookmarkedTalents.length} bookmarked</p>
          </div>
          <Link to="/client/company" className="rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all bg-card">
            <Building2 className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Company Profile</h3>
            <p className="text-sm text-muted-foreground">Manage your profile</p>
          </Link>
          <Link to="/client/jobs" className="rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all bg-card">
            <Briefcase className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Job Postings</h3>
            <p className="text-sm text-muted-foreground">{jobCount} active jobs</p>
          </Link>
          <Link to="/client/settings" className="rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all bg-card">
            <Settings className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </Link>
        </div>

        {/* Bookmarked Talents */}
        <h2 className="text-xl font-semibold mb-4">Saved Talents</h2>
        {bookmarkedTalents.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No saved talents yet</h3>
            <p className="text-muted-foreground mb-4">Explore and bookmark talents you're interested in</p>
            <Link to="/explore"><button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">Explore Talents</button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedTalents.map(talent => (
              <TalentCard key={talent.user_id} talent={talent} isBookmarked showBookmark={false} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
