import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Edit, Eye, Settings, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function FreelancerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchProfiles();
  }, [user, authLoading]);

  const fetchProfiles = async () => {
    const [profileRes, freelancerRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("freelancer_profiles").select("*").eq("user_id", user!.id).single(),
    ]);
    setProfile(profileRes.data);
    setFreelancerProfile(freelancerRes.data);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const initials = profile?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "TB";
  const completionItems = [
    { label: "Profile photo", done: !!profile?.avatar_url },
    { label: "Role title", done: !!freelancerProfile?.role_title },
    { label: "Bio", done: !!freelancerProfile?.bio },
    { label: "Skills", done: freelancerProfile?.skills?.length > 0 },
    { label: "Portfolio", done: freelancerProfile?.portfolio_images?.length > 0 },
  ];
  const completion = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Profile Overview */}
        <div className="rounded-2xl border border-white/10 p-6 mb-6 shadow-card" style={{ background: 'hsl(220 41% 14%)' }}>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-2">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="gradient-hero text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile?.full_name}</h2>
              <p className="text-muted-foreground">{freelancerProfile?.role_title || "Add your role"}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Profile completion</span>
              <span className="font-semibold">{completion}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-hero transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {completionItems.map(item => (
              <Badge key={item.label} variant={item.done ? "default" : "outline"}>{item.label}</Badge>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/freelancer/profile" className="rounded-xl border border-white/10 p-5 hover:shadow-lg hover:border-primary/30 transition-all" style={{ background: 'hsl(220 41% 14%)' }}>
            <Edit className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-white">Edit Profile</h3>
            <p className="text-sm text-white/70">Update your info and skills</p>
          </Link>
          <Link to={`/talent/${user?.id}`} className="rounded-xl border border-white/10 p-5 hover:shadow-lg hover:border-primary/30 transition-all" style={{ background: 'hsl(220 41% 14%)' }}>
            <Eye className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1 text-white">Preview Profile</h3>
            <p className="text-sm text-white/70">See how clients view you</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
