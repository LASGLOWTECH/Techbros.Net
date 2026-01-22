import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Code2, LogOut, User, LayoutDashboard, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "freelancer") return "/freelancer/dashboard";
    return "/client/dashboard";
  };

  const dashboardPath = getDashboardPath();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border backdrop-blur-xl bg-background/90">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              Tech<span className="text-primary">Bros</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/explore") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Explore Talents
            </Link>
            <Link
              to="/jobs"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/jobs") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Jobs
            </Link>
            
            {user ? (
              <>
              {userRole === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-destructive flex items-center gap-1 ${
                    location.pathname.includes("/admin") ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Link
                to={dashboardPath}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname.includes("/dashboard") || location.pathname.includes("/freelancer") || location.pathname.includes("/client") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="accent" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              <Link
                to="/explore"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Explore Talents</span>
              </Link>
              <Link
                to="/jobs"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Jobs</span>
              </Link>
              
              {user ? (
                <>
                  {userRole === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4 pt-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="accent" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
