import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { JobLocationType } from "@/lib/supabase";

/** Escape % and _ for PostgREST ilike exact match on user-provided company names */
function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

const jobSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(150),
    role: z.string().min(2, "Role must be at least 2 characters").max(100),
    description: z
      .string()
      .min(20, "Overview must be at least 20 characters")
      .max(15000, "Overview is too long"),
    location_type: z.enum(["remote", "hybrid", "onsite"]),
    location_detail: z.string().max(500).optional().default(""),
    reports_to: z.string().max(300).optional().default(""),
    application_deadline: z.string().max(32).optional().default(""),
    qualifications: z.string().max(15000).optional().default(""),
    how_to_apply: z.string().max(8000).optional().default(""),
    application_email_subject: z.string().max(250).optional().default(""),
    contact_email: z.string().email("Please enter a valid email address"),
    company_name: z.string().optional(),
  })
  .refine(
    (d) =>
      !d.application_deadline?.trim() ||
      /^\d{4}-\d{2}-\d{2}$/.test(d.application_deadline.trim()),
    { message: "Use a valid closing date", path: ["application_deadline"] }
  );

type JobFormData = z.infer<typeof jobSchema>;

export default function JobForm() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = !!jobId;
  const isAdmin = userRole === "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      role: "",
      description: "",
      location_type: "remote",
      location_detail: "",
      reports_to: "",
      application_deadline: "",
      qualifications: "",
      how_to_apply: "",
      application_email_subject: "",
      contact_email: "",
      company_name: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) initializeForm();
  }, [user, authLoading]);

  const initializeForm = async () => {
    let clientProfileIdForQuery: string | null = null;

    if (isAdmin) {
      setClientProfileId(null);
    } else {
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!profile) {
        toast({
          title: "Profile required",
          description: "Please set up your company profile first.",
          variant: "destructive",
        });
        navigate("/client/company");
        return;
      }

      clientProfileIdForQuery = profile.id;
      setClientProfileId(profile.id);
    }

    if (isEditing) {
      const query = supabase
        .from("jobs")
        .select("*, client_profiles(company_name)")
        .eq("id", jobId);

      if (!isAdmin && clientProfileIdForQuery) {
        query.eq("client_id", clientProfileIdForQuery);
      }

      const { data: job, error } = await query.single();

      if (error || !job) {
        toast({
          title: "Job not found",
          description: "The job you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate(isAdmin ? "/admin/dashboard" : "/client/jobs");
        return;
      }

      const profileRow = job.client_profiles as { company_name: string | null } | null;

      form.reset({
        title: job.title,
        role: job.role,
        description: job.description,
        location_type: job.location_type as JobLocationType,
        location_detail: job.location_detail ?? "",
        reports_to: job.reports_to ?? "",
        application_deadline: job.application_deadline
          ? String(job.application_deadline).slice(0, 10)
          : "",
        qualifications: job.qualifications ?? "",
        how_to_apply: job.how_to_apply ?? "",
        application_email_subject: job.application_email_subject ?? "",
        contact_email: job.contact_email,
        company_name: isAdmin
          ? (job.posted_company_name?.trim() || profileRow?.company_name?.trim() || "")
          : "",
      });
    } else {
      // Pre-fill email with user's email
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (userProfile?.email) {
        form.setValue("contact_email", userProfile.email);
      }
    }

    setLoading(false);
  };

  const onSubmit = async (data: JobFormData) => {
    setSaving(true);

    const t = (s: string | undefined) => {
      const v = (s ?? "").trim();
      return v.length ? v : null;
    };

    const extraFields = {
      location_detail: t(data.location_detail),
      reports_to: t(data.reports_to),
      application_deadline: data.application_deadline?.trim() || null,
      qualifications: t(data.qualifications),
      how_to_apply: t(data.how_to_apply),
      application_email_subject: t(data.application_email_subject),
    };

    let jobData: {
      client_id: string | null;
      posted_company_name: string | null;
      title: string;
      role: string;
      description: string;
      location_type: JobFormData["location_type"];
      contact_email: string;
      is_active: boolean;
      location_detail: string | null;
      reports_to: string | null;
      application_deadline: string | null;
      qualifications: string | null;
      how_to_apply: string | null;
      application_email_subject: string | null;
    };

    if (isAdmin) {
      const companyTrim = (data.company_name ?? "").trim();
      if (!companyTrim) {
        setSaving(false);
        toast({
          title: "Company required",
          description: "Enter the company name for this job.",
          variant: "destructive",
        });
        return;
      }

      const { data: match } = await supabase
        .from("client_profiles")
        .select("id")
        .ilike("company_name", escapeIlikeExact(companyTrim))
        .limit(1)
        .maybeSingle();

      jobData = {
        client_id: match?.id ?? null,
        posted_company_name: match?.id ? null : companyTrim,
        title: data.title,
        role: data.role,
        description: data.description,
        location_type: data.location_type,
        contact_email: data.contact_email,
        is_active: true,
        ...extraFields,
      };
    } else {
      if (!clientProfileId) {
        setSaving(false);
        return;
      }
      jobData = {
        client_id: clientProfileId,
        posted_company_name: null,
        title: data.title,
        role: data.role,
        description: data.description,
        location_type: data.location_type,
        contact_email: data.contact_email,
        is_active: true,
        ...extraFields,
      };
    }

    let error;

    if (isEditing) {
      const result = await supabase
        .from("jobs")
        .update({ ...jobData, updated_at: new Date().toISOString() })
        .eq("id", jobId);
      error = result.error;
    } else {
      const result = await supabase.from("jobs").insert(jobData);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({
        title: "Error saving job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isEditing ? "Job updated" : "Job created",
        description: isEditing
          ? "Your job posting has been updated."
          : "Your job posting is now live!",
      });
      navigate(isAdmin ? "/admin/dashboard" : "/client/jobs");
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
      <div className="container px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/client/jobs")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isAdmin ? "Back to Dashboard" : "Back to Jobs"}
        </Button>

        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Edit Job Posting" : "Create Job Posting"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isEditing
            ? "Update your job details below"
            : "Fill in the details to post a new job opportunity"}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide clear information to attract the right candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Acme Design Studio" {...field} />
                        </FormControl>
                        <FormDescription>
                          Type any name. If it matches an existing client company (same spelling, any
                          case), the job links to that profile for logo and about.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React Developer, UI Designer" {...field} />
                      </FormControl>
                      <FormDescription>
                        The specific role or skill set you're looking for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work arrangement *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (city / region)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Abuja (FCT), Sango-Ota Ogun State"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional. Shown next to remote / hybrid / on-site on the job page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reports_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reports to</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Principal / Executive Director" {...field} />
                      </FormControl>
                      <FormDescription>Optional reporting line for the role.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application closing date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Leave empty if there is no fixed deadline.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About the role &amp; responsibilities *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Main function, key responsibilities, day-to-day expectations…"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications &amp; requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Education, languages, experience, certifications, core competencies…"
                          className="min-h-[160px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional section for education, language, experience, and skills.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="how_to_apply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How to apply</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Send CV and cover letter; use a specific subject line; shortlisted candidates only."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Extra instructions for applicants (contact email is set below).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application_email_subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred email subject (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Defaults to job title if empty" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in the apply-by-email link for the correct subject line.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hiring@company.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Applications are sent to this address (apply button uses it).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(isAdmin ? "/admin/dashboard" : "/client/jobs")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isEditing ? "Update Job" : "Post Job"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}