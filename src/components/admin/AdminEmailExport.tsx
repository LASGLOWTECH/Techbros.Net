import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/csvDownload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/supabase";

type ExportKind = "registered" | "newsletter" | "combined";

export default function AdminEmailExport() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<ExportKind | null>(null);

  const runExport = async (kind: ExportKind) => {
    setExporting(kind);
    try {
      const stamp = new Date().toISOString().slice(0, 10);

      if (kind === "newsletter") {
        const { data, error } = await supabase
          .from("newsletter_subscribers")
          .select("email, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        const rows =
          data?.map((r) => [r.email, new Date(r.created_at).toISOString()]) ?? [];
        downloadCsv(`techbros-newsletter-${stamp}.csv`, ["email", "subscribed_at"], rows);
        toast({
          title: "Download started",
          description: `${rows.length} subscriber row(s).`,
        });
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, created_at");

      if (profilesError) throw profilesError;

      const registeredRows: string[][] = (roles ?? []).map((r) => {
        const p = profiles?.find((x) => x.user_id === r.user_id);
        return [
          p?.email ?? "",
          p?.full_name ?? "",
          r.role as UserRole,
          new Date(r.created_at).toISOString(),
        ];
      });

      if (kind === "registered") {
        downloadCsv(
          `techbros-registered-users-${stamp}.csv`,
          ["email", "full_name", "role", "role_assigned_at"],
          registeredRows
        );
        toast({
          title: "Download started",
          description: `${registeredRows.length} registered user row(s).`,
        });
        return;
      }

      const { data: subs, error: subsError } = await supabase
        .from("newsletter_subscribers")
        .select("email, created_at");

      if (subsError) throw subsError;

      const byEmail = new Map<
        string,
        { display: string; sources: Set<string>; full_name: string; role: string }
      >();

      for (const row of registeredRows) {
        const display = row[0]?.trim() ?? "";
        const key = display.toLowerCase();
        if (!key) continue;
        const full_name = row[1] ?? "";
        const role = row[2] ?? "";
        const cur =
          byEmail.get(key) ?? {
            display,
            sources: new Set<string>(),
            full_name,
            role,
          };
        cur.sources.add("registered");
        if (full_name) cur.full_name = full_name;
        if (role) cur.role = role;
        cur.display = display || cur.display;
        byEmail.set(key, cur);
      }

      for (const s of subs ?? []) {
        const display = s.email.trim();
        const key = display.toLowerCase();
        if (!key) continue;
        const cur =
          byEmail.get(key) ?? {
            display,
            sources: new Set<string>(),
            full_name: "",
            role: "",
          };
        cur.sources.add("newsletter");
        if (!cur.display) cur.display = display;
        byEmail.set(key, cur);
      }

      const combinedRows = [...byEmail.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, v]) => [
          v.display,
          v.full_name,
          v.role,
          [...v.sources].sort().join("+"),
        ]);

      downloadCsv(
        `techbros-emails-combined-${stamp}.csv`,
        ["email", "full_name", "role", "sources"],
        combinedRows
      );
      toast({
        title: "Download started",
        description: `${combinedRows.length} unique email(s) (registered + newsletter).`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: e instanceof Error ? e.message : "Could not load data.",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Email lists</CardTitle>
        <CardDescription>
          Export CSV files for mail merges (open in Excel or Google Sheets). Registered users come
          from accounts with a role; newsletter includes home page signups only.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={exporting !== null}
          onClick={() => runExport("registered")}
        >
          {exporting === "registered" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Registered users (CSV)
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={exporting !== null}
          onClick={() => runExport("newsletter")}
        >
          {exporting === "newsletter" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Newsletter only (CSV)
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={exporting !== null}
          onClick={() => runExport("combined")}
        >
          {exporting === "combined" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Combined &amp; deduped (CSV)
        </Button>
      </CardContent>
    </Card>
  );
}
