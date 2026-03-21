import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus, Briefcase, Edit, Trash2, MapPin, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { jobLocationLine, type Job } from "@/lib/supabase";

export default function ClientJobs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) checkProfileAndFetchJobs();
  }, [user, authLoading]);

  const checkProfileAndFetchJobs = async () => {
    // First check if client has a profile
    const { data: profile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (profile) {
      setClientProfileId(profile.id);
      setHasProfile(true);

      // Fetch jobs for this client
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("client_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error && jobsData) {
        setJobs(jobsData as Job[]);
      }
    }

    setLoading(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setJobs(jobs.filter((j) => j.id !== jobId));
      toast({
        title: "Job deleted",
        description: "The job posting has been removed.",
      });
    }
  };

  const toggleJobStatus = async (job: Job) => {
    const { error } = await supabase
      .from("jobs")
      .update({ is_active: !job.is_active })
      .eq("id", job.id);

    if (error) {
      toast({
        title: "Error updating job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setJobs(
        jobs.map((j) =>
          j.id === job.id ? { ...j, is_active: !j.is_active } : j
        )
      );
      toast({
        title: job.is_active ? "Job deactivated" : "Job activated",
        description: job.is_active
          ? "The job is no longer visible to freelancers."
          : "The job is now visible to freelancers.",
      });
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

  if (!hasProfile) {
    return (
      <Layout>
        <div className="container px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Company Profile First</CardTitle>
              <CardDescription>
                Before posting jobs, please set up your company profile so
                freelancers can learn about your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/client/company">Set Up Company Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground">
              Manage your hiring posts and find talented freelancers
            </p>
          </div>
          <Button asChild>
            <Link to="/client/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No job postings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first job posting to start finding talented
                freelancers.
              </p>
              <Button asChild>
                <Link to="/client/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className={!job.is_active ? "opacity-60" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        {!job.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{job.role}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {jobLocationLine(job)}
                        </span>
                        {job.application_deadline && (
                          <span className="flex items-center gap-1 text-amber-600/90 dark:text-amber-500/90">
                            <Calendar className="h-4 w-4" />
                            Closes{" "}
                            {new Date(job.application_deadline + "T12:00:00").toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {job.contact_email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleJobStatus(job)}
                      >
                        {job.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/client/jobs/${job.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The job posting will
                              be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteJob(job.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}