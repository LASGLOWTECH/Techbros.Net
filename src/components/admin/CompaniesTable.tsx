import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, ImageOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Company {
  id: string;
  user_id: string;
  company_name: string | null;
  cover_image_url: string | null;
  website: string | null;
  created_at: string;
  job_count: number;
}

interface CompaniesTableProps {
  onRefresh: () => void;
}

export default function CompaniesTable({ onRefresh }: CompaniesTableProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("client_profiles")
        .select("id, user_id, company_name, cover_image_url, website, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch job counts for each company
      const companiesWithJobs: Company[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("client_id", profile.id);

          return {
            ...profile,
            job_count: count || 0,
          };
        })
      );

      setCompanies(companiesWithJobs);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch companies",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCoverImage = async (companyId: string, coverUrl: string | null) => {
    try {
      if (coverUrl) {
        // Extract filename from URL and delete from storage
        const urlParts = coverUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        await supabase.storage.from("client-covers").remove([filename]);
      }

      const { error } = await supabase
        .from("client_profiles")
        .update({ cover_image_url: null })
        .eq("id", companyId);

      if (error) throw error;

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_actions").insert({
          admin_id: user.id,
          action_type: "remove_company_banner",
          target_type: "company",
          target_id: companyId,
        });
      }

      toast({
        title: "Banner removed",
        description: "Company banner has been removed.",
      });

      fetchCompanies();
    } catch (error) {
      console.error("Error removing banner:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove banner",
      });
    }
  };

  const deleteCompany = async (companyId: string, userId: string) => {
    try {
      // Delete all jobs for this company first
      await supabase
        .from("jobs")
        .delete()
        .eq("client_id", companyId);

      // Delete the client profile
      const { error } = await supabase
        .from("client_profiles")
        .delete()
        .eq("id", companyId);

      if (error) throw error;

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("admin_actions").insert({
          admin_id: user.id,
          action_type: "delete_company",
          target_type: "company",
          target_id: companyId,
        });
      }

      toast({
        title: "Company deleted",
        description: "Company and all associated jobs have been deleted.",
      });

      fetchCompanies();
      onRefresh();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete company",
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
      <CardHeader>
        <CardTitle>Company Management</CardTitle>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No companies found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={company.cover_image_url || undefined} />
                        <AvatarFallback>
                          {company.company_name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {company.company_name || "Unnamed Company"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{company.job_count}</TableCell>
                  <TableCell>
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {company.cover_image_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCoverImage(company.id, company.cover_image_url)}
                        >
                          <ImageOff className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{company.company_name || "this company"}" and all {company.job_count} associated job(s). This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCompany(company.id, company.user_id)}
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
