import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Settings, Bookmark, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { user, userRole } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isFreelancer = userRole === "freelancer";
  const basePath = isFreelancer ? "/freelancer" : "/client";

  const navItems = isFreelancer
    ? [
        { icon: Home, label: "Home", path: "/" },
        { icon: LayoutDashboard, label: "Dashboard", path: `${basePath}/dashboard` },
        { icon: User, label: "Profile", path: `${basePath}/profile` },
        { icon: Settings, label: "Settings", path: `${basePath}/settings` },
      ]
    : [
        { icon: Home, label: "Home", path: "/" },
        { icon: Search, label: "Explore", path: "/explore" },
        { icon: Bookmark, label: "Saved", path: `${basePath}/bookmarks` },
        { icon: Settings, label: "Settings", path: `${basePath}/settings` },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
              isActive(path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
