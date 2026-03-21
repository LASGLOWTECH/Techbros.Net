import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { jobLocationLine, type JobLocationType } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface JobWithCompany {
  id: string;
  title: string;
  role: string;
  location_type: string;
  location_detail: string | null;
  is_active: boolean;
  created_at: string;
  contact_email: string;
  company_name: string | null;
  application_deadline: string | null;
}

interface JobsTableProps {
  onRefresh: () => void;
}

export default function JobsTable({ onRefresh }: JobsTableProps) {
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          role,
          location_type,
          location_detail,
          is_active,
          created_at,
          contact_email,
          application_deadline,
          posted_company_name,
          client_profiles(company_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedJobs: JobWithCompany[] = data?.map((job) => {
        const posted = job.posted_company_name?.trim();
        const fromProfile = job.client_profiles?.company_name?.trim();
        return {
          id: job.id,
          title: job.title,
          role: job.role,
          location_type: job.location_type,
          is_active: job.is_active,
          created_at: job.created_at,
          contact_email: job.contact_email,
          company_name: posted || fromProfile || null,
        };
      }) || [];

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch jobs",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: !currentStatus })
        .eq("id", jobId);

      if (error) throw error;

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_actions").insert({
          admin_id: user.id,
          action_type: currentStatus ? "unpublish_job" : "publish_job",
          target_type: "job",
          target_id: jobId,
        });
      }

      toast({
        title: currentStatus ? "Job unpublished" : "Job published",
        description: `Job has been ${currentStatus ? "unpublished" : "published"}.`,
      });

      fetchJobs();
      onRefresh();
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job status",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_actions").insert({
          admin_id: user.id,
          action_type: "delete_job",
          target_type: "job",
          target_id: jobId,
        });
      }

      toast({
        title: "Job deleted",
        description: "Job has been permanently deleted.",
      });

      fetchJobs();
      onRefresh();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Job Moderation</CardTitle>
        <Button size="sm" onClick={() => navigate("/admin/jobs/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No jobs found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Closes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company_name || "Unknown"}</TableCell>
                  <TableCell>{job.role}</TableCell>
                  <TableCell className="max-w-[140px] text-sm text-muted-foreground">
                    {jobLocationLine({
                      location_type: job.location_type as JobLocationType,
                      location_detail: job.location_detail,
                    })}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {job.application_deadline
                      ? new Date(job.application_deadline + "T12:00:00").toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {job.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(job.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleJobStatus(job.id, job.is_active)}
                      >
                        {job.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the job "{job.title}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteJob(job.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
