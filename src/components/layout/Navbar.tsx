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
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Floating navbar container */}
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <div className="flex h-14 items-center justify-between rounded-2xl border border-border/40 bg-background/60 backdrop-blur-2xl px-5 shadow-lg shadow-black/20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight hidden sm:block text-foreground">
              Tech<span className="text-primary">Bros</span>
            </span>
          </Link>

          {/* Desktop Navigation - centered links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-foreground ${
                isActive("/explore") ? "text-foreground bg-secondary/50" : "text-muted-foreground"
              }`}
            >
              Explore
            </Link>
            <Link
              to="/jobs"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-foreground ${
                isActive("/jobs") ? "text-foreground bg-secondary/50" : "text-muted-foreground"
              }`}
            >
              Jobs
            </Link>
            
            {user && userRole === "admin" && (
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1.5 ${
                  location.pathname.includes("/admin") ? "text-foreground bg-secondary/50" : "text-muted-foreground"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            {user && (
              <Link
                to={dashboardPath}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname.includes("/dashboard") || location.pathname.includes("/freelancer") || location.pathname.includes("/client") ? "text-foreground bg-secondary/50" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium px-5 h-8 text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-2xl p-3 shadow-lg shadow-black/20 animate-slide-up">
            <div className="flex flex-col gap-1">
              <Link
                to="/explore"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Explore Talents</span>
              </Link>
              <Link
                to="/jobs"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Jobs</span>
              </Link>
              
              {user ? (
                <>
                  {userRole === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-2 pt-2 border-t border-border/30 mt-1">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full rounded-xl text-sm">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm">
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
