import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, MapPin, Building2, Mail, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { JobWithClient, JobLocationType } from "@/lib/supabase";

const locationLabels: Record<JobLocationType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
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
      .eq("id", jobId)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      setJob(data as unknown as JobWithClient);
    }
    setLoading(false);
  };

  const getMailtoUrl = () => {
    if (!job) return "#";
    const subject = encodeURIComponent(`Application for ${job.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI am interested in the ${job.title} position at ${job.client_profiles.company_name || "your company"}.\n\n[Please attach your CV/resume and any relevant portfolio links]\n\nBest regards`
    );
    return `mailto:${job.contact_email}?subject=${subject}&body=${body}`;
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

  if (!job) {
    return (
      <Layout>
        <div className="container px-4 py-8 max-w-3xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="font-semibold text-lg mb-2">Job not found</h3>
              <p className="text-muted-foreground text-center mb-4">
                This job posting may have been removed or is no longer active.
              </p>
              <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const postedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Cover Image */}
        {job.client_profiles.cover_image_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={job.client_profiles.cover_image_url}
              alt={job.client_profiles.company_name || "Company"}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Job Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
            <Building2 className="h-5 w-5" />
            <span>{job.client_profiles.company_name || "Company"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {job.role}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {locationLabels[job.location_type]}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Posted {postedDate}
            </span>
          </div>
        </div>

        {/* Apply Button */}
        <a href={getMailtoUrl()} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="w-full sm:w-auto mb-8">
            <Mail className="h-4 w-4 mr-2" />
            Apply via Email
          </Button>
        </a>

        <Separator className="my-8" />

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground/90">{job.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Email */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <a href={`mailto:${job.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="h-4 w-4" />
              {job.contact_email}
            </a>
          </CardContent>
        </Card>

        {/* Company Info */}
        {job.client_profiles.about && (
          <Card>
            <CardHeader>
              <CardTitle>About {job.client_profiles.company_name || "the Company"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90 whitespace-pre-wrap">
                {job.client_profiles.about}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Bottom Apply CTA */}
        <div className="mt-8 p-6 rounded-xl border border-border bg-card text-center">
          <h3 className="font-semibold text-lg mb-2">Interested in this role?</h3>
          <p className="text-muted-foreground mb-4">
            Send your application to get started
          </p>
          <a href={getMailtoUrl()} target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Apply via Email
            </Button>
          </a>
        </div>
      </div>
    </Layout>
  );
}