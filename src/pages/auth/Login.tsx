import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Code2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { signIn, userRole, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    });

    // Navigate based on role - delay to allow role to be fetched
    setTimeout(() => {
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "freelancer") {
        navigate("/freelancer/dashboard");
      } else if (userRole === "client") {
        navigate("/client/dashboard");
      } else {
        navigate("/explore");
      }
    }, 500);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    const { error } = await resetPassword(forgotEmail);

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message,
      });
      setForgotLoading(false);
      return;
    }

    setEmailSent(true);
    setForgotLoading(false);
    toast({
      title: "Reset email sent!",
      description: "Check your inbox for the password reset link.",
    });
  };

  const closeForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotEmail("");
    setEmailSent(false);
  };

  return (
    <div className="min-h-screen flex gradient-page">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-glow">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TechBros</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(217 91% 53%) 0%, hsl(220 80% 40%) 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        <div className="relative z-10 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Connect with Tech Talent</h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Access a network of skilled professionals ready to help bring your projects to life.
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={closeForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {emailSent ? "Check your email" : "Forgot password?"}
            </DialogTitle>
            <DialogDescription>
              {emailSent
                ? "We've sent a password reset link to your email address. Click the link to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>

          {emailSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeForgotPassword}
                  className="flex-1"
                >
                  Back to login
                </Button>
                <Button
                  onClick={() => setEmailSent(false)}
                  className="flex-1"
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForgotPassword}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
