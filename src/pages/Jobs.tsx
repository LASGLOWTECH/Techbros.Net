import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Briefcase, MapPin, Building2, Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { JobWithClient, JobLocationType } from "@/lib/supabase";

const locationLabels: Record<JobLocationType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const locationFilters = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export default function Jobs() {
  const [jobs, setJobs] = useState<JobWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        role,
        description,
        location_type,
        contact_email,
        is_active,
        created_at,
        client_profiles!inner (
          id,
          company_name,
          cover_image_url,
          about
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data as unknown as JobWithClient[]);
    }
    setLoading(false);
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocations([]);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client_profiles.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocations.length === 0 ||
      selectedLocations.includes(job.location_type);

    return matchesSearch && matchesLocation;
  });

  const hasActiveFilters = searchQuery !== "" || selectedLocations.length > 0;

  return (
    <Layout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">
            Discover exciting opportunities from companies looking for talent like you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, roles, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-secondary" : ""}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {selectedLocations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedLocations.length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="p-4 rounded-lg border border-border bg-card mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Location Type</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {locationFilters.map((filter) => (
                  <Badge
                    key={filter.value}
                    variant={selectedLocations.includes(filter.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleLocation(filter.value)}
                  >
                    {filter.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
          </p>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No jobs found</h3>
              <p className="text-muted-foreground text-center">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query"
                  : "Check back later for new opportunities"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Company Cover/Logo */}
                      <div className="shrink-0">
                        {job.client_profiles.cover_image_url ? (
                          <img
                            src={job.client_profiles.cover_image_url}
                            alt={job.client_profiles.company_name || "Company"}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                        <p className="text-muted-foreground mb-2">
                          {job.client_profiles.company_name || "Company"}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <Badge variant="secondary">{job.role}</Badge>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {locationLabels[job.location_type]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}