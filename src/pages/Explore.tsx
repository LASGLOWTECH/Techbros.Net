import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { TalentCard } from "@/components/talent/TalentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { FreelancerWithProfile } from "@/lib/supabase";

const skillFilters = [
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Mobile Dev",
  "DevOps",
  "Data Science",
  "Blockchain",
];

const availabilityFilters = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
];

export default function Explore() {
  const [talents, setTalents] = useState<FreelancerWithProfile[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { user, userRole } = useAuth();
  const { toast } = useToast();

  const slugToDisplayName = (slug?: string | null) => {
    if (!slug) return null;
    const trimmed = slug.replace(/-[0-9a-f]{6}(?:-\d+)?$/i, "");
    const parts = trimmed.split("-").filter(Boolean);
    if (parts.length === 0) return null;
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  };

  useEffect(() => {
    fetchTalents();
    if (user) fetchBookmarks();
  }, [user]);

  const fetchTalents = async () => {
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
        slug,
        is_public,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("is_public", true);

    if (error) {
      console.error("Error fetching talents:", error);
      setLoading(false);
      return;
    }

    const formattedTalents: FreelancerWithProfile[] = (data || []).map((item: any) => {
      const profileRow = item.profiles || null;
      const fallbackName = slugToDisplayName(item.slug) || "Freelancer";
      return {
        user_id: item.user_id,
        full_name: profileRow?.full_name || fallbackName,
        avatar_url: profileRow?.avatar_url || null,
        role_title: item.role_title,
        bio: item.bio,
        skills: item.skills || [],
        availability: item.availability || "available",
        location: item.location,
        project_link: item.project_link,
        portfolio_images: item.portfolio_images || [],
        slug: item.slug,
        is_public: item.is_public,
      };
    });

    setTalents(formattedTalents);
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("freelancer_id")
      .eq("user_id", user.id);

    if (data) {
      setBookmarks(data.map((b) => b.freelancer_id));
    }
  };

  const toggleBookmark = async (freelancerId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to bookmark profiles.",
      });
      return;
    }

    const isBookmarked = bookmarks.includes(freelancerId);

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("freelancer_id", freelancerId);
      
      setBookmarks(bookmarks.filter((id) => id !== freelancerId));
      toast({ title: "Bookmark removed" });
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, freelancer_id: freelancerId });
      
      setBookmarks([...bookmarks, freelancerId]);
      toast({ title: "Profile bookmarked!" });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedAvailability(null);
    setSearchQuery("");
  };

  const filteredTalents = talents.filter((talent) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      talent.full_name.toLowerCase().includes(searchLower) ||
      talent.role_title?.toLowerCase().includes(searchLower) ||
      talent.bio?.toLowerCase().includes(searchLower) ||
      talent.skills.some((s) => s.toLowerCase().includes(searchLower));

    // Skills filter
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) =>
        talent.skills.some((s) =>
          s.toLowerCase().includes(skill.toLowerCase())
        )
      );

    // Availability filter
    const matchesAvailability =
      !selectedAvailability || talent.availability === selectedAvailability;

    return matchesSearch && matchesSkills && matchesAvailability;
  });

  const hasActiveFilters =
    searchQuery || selectedSkills.length > 0 || selectedAvailability;

  return (
    <Layout>
      <div className="container px-4 md:px-24 mx-auto py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Explore <span className="text-gradient">Tech Talents</span>
          </h1>
          <p className="text-muted-foreground">
            Discover skilled professionals ready to bring your projects to life.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 rounded-xl border border-white/10 animate-slide-up" style={{ background: 'hsl(220 41% 14%)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Skills */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillFilters.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Availability
                  </label>
                  <div className="flex gap-2">
                    {availabilityFilters.map((status) => (
                      <Badge
                        key={status.value}
                        variant={
                          selectedAvailability === status.value ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedAvailability(
                            selectedAvailability === status.value ? null : status.value
                          )
                        }
                      >
                        {status.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <divs
                key={i}
                className="h-80 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No talents found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredTalents.length} talent{filteredTalents.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredTalents.map((talent) => (
                <TalentCard
                  key={talent.user_id}
                  talent={talent}
                  isBookmarked={bookmarks.includes(talent.user_id)}
                  onBookmark={() => toggleBookmark(talent.user_id)}
                  showBookmark={userRole === "client"}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
