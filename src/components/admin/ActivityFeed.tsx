import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Briefcase, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string | null;
  notes: string | null;
  created_at: string;
  admin_name?: string;
}

const actionLabels: Record<string, string> = {
  suspend_user: "Suspended user",
  unsuspend_user: "Unsuspended user",
  delete_user: "Deleted user",
  publish_job: "Published job",
  unpublish_job: "Unpublished job",
  delete_job: "Deleted job",
  delete_company: "Deleted company",
  remove_company_banner: "Removed company banner",
};

const getActionIcon = (targetType: string) => {
  switch (targetType) {
    case "user":
      return <User className="h-4 w-4" />;
    case "job":
      return <Briefcase className="h-4 w-4" />;
    case "company":
      return <Building2 className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

export default function ActivityFeed() {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const { data: actionsData, error: actionsError } = await supabase
        .from("admin_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;

      // Get admin names
      const adminIds = [...new Set(actionsData?.map(a => a.admin_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", adminIds);

      const actionsWithNames: AdminAction[] = (actionsData || []).map(action => ({
        ...action,
        admin_name: profiles?.find(p => p.user_id === action.admin_id)?.full_name || "Unknown Admin",
      }));

      setActions(actionsWithNames);
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
        <CardTitle>Admin Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No admin actions recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActionIcon(action.target_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {actionLabels[action.action_type] || action.action_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {action.admin_name}
                    </p>
                    {action.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(action.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
