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

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  role: z.string().min(2, "Role must be at least 2 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  location_type: z.enum(["remote", "hybrid", "onsite"]),
  contact_email: z.string().email("Please enter a valid email address"),
});

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
  const [clientProfiles, setClientProfiles] = useState<{ id: string; company_name: string | null }[]>([]);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      role: "",
      description: "",
      location_type: "remote",
      contact_email: "",
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
    if (isAdmin) {
      // Admin: fetch all client profiles to pick from
      const { data: profiles } = await supabase
        .from("client_profiles")
        .select("id, company_name")
        .order("company_name");

      setClientProfiles(profiles || []);

      if (profiles && profiles.length > 0) {
        setClientProfileId(profiles[0].id);
      }
    } else {
      // Client: get their own profile
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

      setClientProfileId(profile.id);
    }

    // If editing, fetch job data
    if (isEditing) {
      const query = supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId);
      
      // Clients can only edit their own jobs; admins can edit any
      if (!isAdmin) {
        query.eq("client_id", clientProfileId!);
      }

      const { data: job, error } = await query.single();

      if (error || !job) {
        toast({
          title: "Job not found",
          description: "The job you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate("/client/jobs");
        return;
      }

      form.reset({
        title: job.title,
        role: job.role,
        description: job.description,
        location_type: job.location_type as JobLocationType,
        contact_email: job.contact_email,
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
    if (!clientProfileId) return;
    setSaving(true);

    const jobData = {
      client_id: clientProfileId,
      title: data.title,
      role: data.role,
      description: data.description,
      location_type: data.location_type,
      contact_email: data.contact_email,
      is_active: true,
    };

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
                {/* Admin: Company selector */}
                {isAdmin && clientProfiles.length > 0 && (
                  <div className="space-y-2">
                    <FormLabel>Company *</FormLabel>
                    <Select value={clientProfileId || ""} onValueChange={setClientProfileId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientProfiles.map((cp) => (
                          <SelectItem key={cp.id} value={cp.id}>
                            {cp.company_name || "Unnamed Company"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
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
                  name="location_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hiring@company.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Freelancers will send their applications to this email
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