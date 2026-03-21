import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, MapPin, Building2, Mail, Calendar } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import {
  jobDisplayCompanyName,
  jobLocationLine,
  type JobWithClient,
} from "@/lib/supabase";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId, user?.id]);

  const fetchJob = async () => {
    const baseSelect = `
      id,
      title,
      role,
      description,
      location_type,
      location_detail,
      reports_to,
      application_deadline,
      qualifications,
      how_to_apply,
      application_email_subject,
      is_active,
      created_at,
      posted_company_name,
      client_profiles (
        id,
        company_name,
        cover_image_url,
        about
      )
    `;
    const select = user ? `${baseSelect}, contact_email` : baseSelect;
    const { data, error } = await supabase
      .from("jobs")
      .select(select)
      .eq("id", jobId)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      setJob(data as unknown as JobWithClient);
    }
    setLoading(false);
  };

  const getMailtoUrl = () => {
    if (!job?.contact_email) return "#";
    const subjectLine =
      job.application_email_subject?.trim() || job.title;
    const subject = encodeURIComponent(subjectLine);
    const body = encodeURIComponent(
      `Hi,\n\nI am interested in the ${job.title} position at ${jobDisplayCompanyName(job)}.\n\n[Please attach your CV/resume and any relevant portfolio links]\n\nBest regards`
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

  const closingDate = job.application_deadline
    ? new Date(job.application_deadline + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Cover Image */}
        {job.client_profiles?.cover_image_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img
              src={job.client_profiles.cover_image_url}
              alt={jobDisplayCompanyName(job)}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Job Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
            <Building2 className="h-5 w-5" />
            <span>{jobDisplayCompanyName(job)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {job.role}
            </Badge>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {jobLocationLine(job)}
            </span>
            {job.reports_to?.trim() && (
              <span className="text-sm text-muted-foreground">
                Reports to: <span className="text-foreground/90">{job.reports_to.trim()}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Posted {postedDate}
            </span>
            {closingDate && (
              <span className="flex items-center gap-1 text-amber-500/90 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Closes {closingDate}
              </span>
            )}
          </div>
        </div>

        {/* Apply Button */}
        {user ? (
          <a href={getMailtoUrl()} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto mb-8" disabled={!job.contact_email}>
              <Mail className="h-4 w-4 mr-2" />
              Apply via Email
            </Button>
          </a>
        ) : (
          <div className="mb-8">
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/login")}>
              Sign in to Apply
            </Button>
          </div>
        )}

        <Separator className="my-8" />

        {/* About the role */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About the role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground/90">{job.description}</p>
            </div>
          </CardContent>
        </Card>

        {job.qualifications?.trim() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Qualifications &amp; requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground/90">{job.qualifications.trim()}</p>
            </CardContent>
          </Card>
        )}

        {job.how_to_apply?.trim() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>How to apply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground/90">{job.how_to_apply.trim()}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Email */}
        {user ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {job.contact_email ? (
                <a href={`mailto:${job.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  {job.contact_email}
                </a>
              ) : (
                <p className="text-muted-foreground">Contact email is not available.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">Sign in to view contact details and apply.</p>
              <Button onClick={() => navigate("/login")}>Sign in</Button>
            </CardContent>
          </Card>
        )}

        {/* Company Info */}
        {job.client_profiles?.about && (
          <Card>
            <CardHeader>
              <CardTitle>About {jobDisplayCompanyName(job)}</CardTitle>
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
            {user ? "Send your application to get started" : "Sign in to apply for this job"}
          </p>
          {user ? (
            <a href={getMailtoUrl()} target="_blank" rel="noopener noreferrer">
              <Button size="lg" disabled={!job.contact_email}>
                <Mail className="h-4 w-4 mr-2" />
                Apply via Email
              </Button>
            </a>
          ) : (
            <Button size="lg" onClick={() => navigate("/login")}>
              Sign in to Apply
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
