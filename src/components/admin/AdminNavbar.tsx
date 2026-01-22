import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminNavbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-destructive/10 backdrop-blur supports-[backdrop-filter]:bg-destructive/5">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive">
            <Shield className="h-5 w-5 text-destructive-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            TechBros Admin
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View Site
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
