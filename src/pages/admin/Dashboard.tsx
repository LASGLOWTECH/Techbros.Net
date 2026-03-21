import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Briefcase, Building2, Activity, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNavbar from "@/components/admin/AdminNavbar";
import UsersTable from "@/components/admin/UsersTable";
import JobsTable from "@/components/admin/JobsTable";
import CompaniesTable from "@/components/admin/CompaniesTable";
import ActivityFeed from "@/components/admin/ActivityFeed";
import { AdminMonetization } from "@/components/admin/AdminMonetization";
import AdminEmailExport from "@/components/admin/AdminEmailExport";
import ContactInquiriesTable from "@/components/admin/ContactInquiriesTable";

interface PlatformMetrics {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalAdmins: number;
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
}

export default function AdminDashboard() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/login");
      return;
    }

    if (user && userRole === "admin") {
      fetchMetrics();
    }
  }, [user, userRole, authLoading, navigate]);

  const fetchMetrics = async () => {
    try {
      // Fetch user role counts
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role");

      const totalUsers = roles?.length || 0;
      const totalFreelancers = roles?.filter(r => r.role === "freelancer").length || 0;
      const totalClients = roles?.filter(r => r.role === "client").length || 0;
      const totalAdmins = roles?.filter(r => r.role === "admin").length || 0;

      // Fetch jobs counts
      const { data: jobs } = await supabase
        .from("jobs")
        .select("is_active");

      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(j => j.is_active).length || 0;

      // Fetch companies count
      const { count: totalCompanies } = await supabase
        .from("client_profiles")
        .select("*", { count: "exact", head: true });

      setMetrics({
        totalUsers,
        totalFreelancers,
        totalClients,
        totalAdmins,
        totalJobs,
        activeJobs,
        totalCompanies: totalCompanies || 0,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and management
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.totalFreelancers} freelancers, {metrics?.totalClients} clients
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.activeJobs} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered companies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalAdmins || 0}</div>
              <p className="text-xs text-muted-foreground">
                Platform administrators
              </p>
            </CardContent>
          </Card>
        </div>

        <AdminEmailExport />

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UsersTable onRefresh={fetchMetrics} />
          </TabsContent>
          <TabsContent value="jobs">
            <JobsTable onRefresh={fetchMetrics} />
          </TabsContent>
          <TabsContent value="companies">
            <CompaniesTable onRefresh={fetchMetrics} />
          </TabsContent>
          <TabsContent value="monetization">
            <AdminMonetization />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityFeed />
          </TabsContent>
          <TabsContent value="contact">
            <ContactInquiriesTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
