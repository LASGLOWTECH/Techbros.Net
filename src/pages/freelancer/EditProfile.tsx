import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Plus, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AvailabilityStatus } from "@/lib/supabase";

const profileSchema = z.object({
  role_title: z.string().min(2, "Role title must be at least 2 characters").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  about_long: z.string().max(2000, "About section must be less than 2000 characters").optional(),
  hero_intro: z.string().max(80, "Intro must be less than 80 characters").optional(),
  hero_subtitle: z.string().max(120, "Subtitle must be less than 120 characters").optional(),
  hero_tagline: z.string().max(180, "Tagline must be less than 180 characters").optional(),
  cv_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  skill_summary: z.string().max(200, "Skill summary must be less than 200 characters").optional(),
  location: z.string().max(100).optional(),
  availability: z.enum(["available", "busy", "unavailable"]),
  project_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  contact_email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  contact_phone: z.string().max(40).optional(),
  contact_whatsapp: z.string().max(120).optional(),
  contact_location: z.string().max(120).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type PortfolioService = { title: string; description: string };
type PortfolioExperience = { role: string; company: string; start: string; end: string; summary: string };
type PortfolioProject = { title: string; description: string; url: string; image_url: string; category: string };
type PortfolioAward = { title: string; issuer: string; year: string; description: string };
type PortfolioCertification = { title: string; issuer: string; year: string; url: string };
type SocialLink = { label: string; url: string };

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioImageUrlInput, setPortfolioImageUrlInput] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingProjectImages, setUploadingProjectImages] = useState<Record<number, boolean>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [services, setServices] = useState<PortfolioService[]>([]);
  const [experiences, setExperiences] = useState<PortfolioExperience[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [awards, setAwards] = useState<PortfolioAward[]>([]);
  const [certifications, setCertifications] = useState<PortfolioCertification[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role_title: "",
      bio: "",
      about_long: "",
      hero_intro: "",
      hero_subtitle: "",
      hero_tagline: "",
      cv_url: "",
      skill_summary: "",
      location: "",
      availability: "available",
      project_link: "",
      contact_email: "",
      contact_phone: "",
      contact_whatsapp: "",
      contact_location: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const [freelancerRes, profileRes] = await Promise.all([
      supabase
        .from("freelancer_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle(),
    ]);

    if (freelancerRes.data) {
      form.reset({
        role_title: freelancerRes.data.role_title || "",
        bio: freelancerRes.data.bio || "",
        about_long: freelancerRes.data.about_long || "",
        hero_intro: freelancerRes.data.hero_intro || "",
        hero_subtitle: freelancerRes.data.hero_subtitle || "",
        hero_tagline: freelancerRes.data.hero_tagline || "",
        cv_url: freelancerRes.data.cv_url || "",
        skill_summary: freelancerRes.data.skill_summary || "",
        location: freelancerRes.data.location || "",
        availability: (freelancerRes.data.availability as AvailabilityStatus) || "available",
        project_link: freelancerRes.data.project_link || "",
        contact_email: freelancerRes.data.contact_email || "",
        contact_phone: freelancerRes.data.contact_phone || "",
        contact_whatsapp: freelancerRes.data.contact_whatsapp || "",
        contact_location: freelancerRes.data.contact_location || "",
      });
      setSkills(freelancerRes.data.skills || []);
      setPortfolioImages(freelancerRes.data.portfolio_images || []);
      setServices((freelancerRes.data.services as PortfolioService[]) || []);
      setExperiences((freelancerRes.data.experiences as PortfolioExperience[]) || []);
      setProjects((freelancerRes.data.projects as PortfolioProject[]) || []);
      setAwards((freelancerRes.data.awards as PortfolioAward[]) || []);
      setCertifications((freelancerRes.data.certifications as PortfolioCertification[]) || []);
      setSocialLinks((freelancerRes.data.social_links as SocialLink[]) || []);
      setProfileSlug(freelancerRes.data.slug || null);
    }

    if (profileRes.data) {
      setAvatarUrl(profileRes.data.avatar_url);
      setAvatarUrlInput(profileRes.data.avatar_url || "");
      setFullName(profileRes.data.full_name || "");
    }

    setLoading(false);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    // Delete old avatar if exists
    if (avatarUrl) {
      const oldPath = avatarUrl.split("/portfolios/")[1];
      if (oldPath) {
        await supabase.storage.from("portfolios").remove([oldPath]);
      }
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user!.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolios")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("portfolios")
      .getPublicUrl(fileName);

    const newAvatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user!.id);

    if (updateError) {
      toast({
        title: "Failed to save avatar",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      setAvatarUrl(newAvatarUrl);
      setAvatarUrlInput(newAvatarUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile photo has been updated.",
      });
    }

    setUploadingAvatar(false);
    e.target.value = "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (portfolioImages.length + files.length > 3) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 3 portfolio images.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB.`,
          variant: "destructive",
        });
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("portfolios")
        .upload(fileName, file);

      if (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const { data: urlData } = supabase.storage
          .from("portfolios")
          .getPublicUrl(fileName);
        newImages.push(urlData.publicUrl);
      }
    }

    setPortfolioImages([...portfolioImages, ...newImages]);
    setUploadingImages(false);
    e.target.value = "";
  };

  const handleRemoveImage = async (imageUrl: string) => {
    const path = imageUrl.split("/portfolios/")[1];
    if (path) {
      await supabase.storage.from("portfolios").remove([path]);
    }
    setPortfolioImages(portfolioImages.filter((img) => img !== imageUrl));
  };

  const isValidHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAvatarUrlSave = async () => {
    const trimmed = avatarUrlInput.trim();
    if (!trimmed || !isValidHttpUrl(trimmed)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: trimmed, updated_at: new Date().toISOString() })
      .eq("user_id", user!.id);

    setUploadingAvatar(false);

    if (updateError) {
      toast({
        title: "Failed to save avatar",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      setAvatarUrl(trimmed);
      toast({ title: "Avatar updated" });
    }
  };

  const handleProjectImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Project image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingProjectImages((prev) => ({ ...prev, [index]: true }));

    const currentUrl = projects[index]?.image_url;
    if (currentUrl) {
      const marker = "/storage/v1/object/public/portfolios/";
      const markerIndex = currentUrl.indexOf(marker);
      if (markerIndex !== -1) {
        const oldPath = currentUrl.slice(markerIndex + marker.length);
        if (oldPath) {
          await supabase.storage.from("portfolios").remove([oldPath]);
        }
      }
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user!.id}/project-${index}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolios")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploadingProjectImages((prev) => ({ ...prev, [index]: false }));
      return;
    }

    const { data: urlData } = supabase.storage
      .from("portfolios")
      .getPublicUrl(fileName);

    updateProject(index, { image_url: urlData.publicUrl });
    setUploadingProjectImages((prev) => ({ ...prev, [index]: false }));
  };

  const handleAddPortfolioImageUrl = () => {
    const trimmed = portfolioImageUrlInput.trim();
    if (!trimmed || !isValidHttpUrl(trimmed)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }
    if (portfolioImages.length >= 3) {
      toast({
        title: "Limit reached",
        description: "You can upload up to 3 portfolio images.",
        variant: "destructive",
      });
      return;
    }
    if (portfolioImages.includes(trimmed)) {
      toast({
        title: "Already added",
        description: "That image URL is already in your gallery.",
      });
      return;
    }
    setPortfolioImages((prev) => [...prev, trimmed]);
    setPortfolioImageUrlInput("");
  };

  const updateService = (index: number, patch: Partial<PortfolioService>) => {
    setServices((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const updateExperience = (index: number, patch: Partial<PortfolioExperience>) => {
    setExperiences((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const updateProject = (index: number, patch: Partial<PortfolioProject>) => {
    setProjects((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const updateAward = (index: number, patch: Partial<PortfolioAward>) => {
    setAwards((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const updateCertification = (index: number, patch: Partial<PortfolioCertification>) => {
    setCertifications((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    setSocialLinks((prev) => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);

    const { error } = await supabase
      .from("freelancer_profiles")
      .upsert({
        user_id: user!.id,
        role_title: data.role_title,
        bio: data.bio || null,
        about_long: data.about_long || null,
        hero_intro: data.hero_intro || null,
        hero_subtitle: data.hero_subtitle || null,
        hero_tagline: data.hero_tagline || null,
        cv_url: data.cv_url || null,
        skill_summary: data.skill_summary || null,
        location: data.location || null,
        availability: data.availability,
        project_link: data.project_link || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        contact_whatsapp: data.contact_whatsapp || null,
        contact_location: data.contact_location || null,
        skills,
        portfolio_images: portfolioImages,
        services,
        experiences,
        projects,
        awards,
        certifications,
        social_links: socialLinks,
        is_public: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    setSaving(false);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
      navigate("/freelancer");
    }
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

  return (
    <Layout>
      <div className="container px-4 py-8 max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/freelancer")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button asChild variant="outline">
            <Link to={profileSlug ? `/talent/${profileSlug}` : `/talent/${user?.id}`}>Preview Profile</Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground mb-8">
          Update your profile to attract more clients
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-3">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="gradient-hero text-primary-foreground text-2xl">
                      {fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "TB"}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Upload a professional photo. Max 2MB, JPG or PNG recommended.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Or paste an image URL"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarUrlSave}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Use URL"
                  )}
                </Button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="space-y-4 rounded-xl border border-white/10 bg-card/60 p-4">
              <div>
                <h2 className="text-lg font-semibold">Hero Section</h2>
                <p className="text-sm text-muted-foreground">This powers the top section of your public portfolio.</p>
              </div>
              <FormField
                control={form.control}
                name="hero_intro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intro Line</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hello, I'm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Product Designer & Brand Strategist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short one-liner about your work and impact"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cv_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV/Resume Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://drive.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Title */}
            <FormField
              control={form.control}
              name="role_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Full Stack Developer" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your primary professional title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="about_long"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Section</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your background, values, and the kind of work you love."
                      className="min-h-[160px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/2000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills */}
            <div className="space-y-3">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Node.js)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Add up to 10 skills that describe your expertise
              </p>
            </div>

            <FormField
              control={form.control}
              name="skill_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Summary</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Product design, UI systems, rapid prototyping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Services</h3>
                  <p className="text-xs text-muted-foreground">List what you offer clients.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setServices((prev) => [...prev, { title: "", description: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground">No services added yet.</p>
              )}
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Input
                        placeholder="Service title"
                        value={service.title}
                        onChange={(e) => updateService(index, { title: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setServices((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Describe what you deliver"
                      className="mt-2 min-h-[80px] resize-none"
                      value={service.description}
                      onChange={(e) => updateService(index, { description: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lagos, Nigeria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability */}
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Available for work
                        </span>
                      </SelectItem>
                      <SelectItem value="busy">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          Busy but open to offers
                        </span>
                      </SelectItem>
                      <SelectItem value="unavailable">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Not available
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Experience</h3>
                  <p className="text-xs text-muted-foreground">Show where you've worked or projects you've led.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExperiences((prev) => [...prev, { role: "", company: "", start: "", end: "", summary: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {experiences.length === 0 && (
                <p className="text-sm text-muted-foreground">No experience added yet.</p>
              )}
              <div className="space-y-3">
                {experiences.map((item, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Role"
                        value={item.role}
                        onChange={(e) => updateExperience(index, { role: e.target.value })}
                      />
                      <Input
                        placeholder="Company"
                        value={item.company}
                        onChange={(e) => updateExperience(index, { company: e.target.value })}
                      />
                      <Input
                        placeholder="Start (e.g., Jan 2022)"
                        value={item.start}
                        onChange={(e) => updateExperience(index, { start: e.target.value })}
                      />
                      <Input
                        placeholder="End (e.g., Present)"
                        value={item.end}
                        onChange={(e) => updateExperience(index, { end: e.target.value })}
                      />
                    </div>
                    <Textarea
                      placeholder="Highlights or responsibilities"
                      className="mt-2 min-h-[90px] resize-none"
                      value={item.summary}
                      onChange={(e) => updateExperience(index, { summary: e.target.value })}
                    />
                    <div className="mt-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExperiences((prev) => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Link */}
            <FormField
              control={form.control}
              name="project_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/yourusername or portfolio URL"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to your GitHub, Behance, or a live project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Projects</h3>
                  <p className="text-xs text-muted-foreground">Add featured projects with images and links.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProjects((prev) => [...prev, { title: "", description: "", url: "", image_url: "", category: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects added yet.</p>
              )}
              <div className="space-y-3">
                {projects.map((project, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Project title"
                        value={project.title}
                        onChange={(e) => updateProject(index, { title: e.target.value })}
                      />
                      <Input
                        placeholder="Category (e.g., UI Design)"
                        value={project.category}
                        onChange={(e) => updateProject(index, { category: e.target.value })}
                      />
                      <Input
                        placeholder="Project URL"
                        value={project.url}
                        onChange={(e) => updateProject(index, { url: e.target.value })}
                      />
                      <Input
                        placeholder="Image URL (optional)"
                        value={project.image_url}
                        onChange={(e) => updateProject(index, { image_url: e.target.value })}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {project.image_url ? (
                        <div className="h-20 w-32 overflow-hidden rounded-lg border border-white/10">
                          <img
                            src={project.image_url}
                            alt={`${project.title || "Project"} preview`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                        {uploadingProjectImages[index] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProjectImageUpload(index, e)}
                          disabled={uploadingProjectImages[index]}
                        />
                      </label>
                      {project.image_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateProject(index, { image_url: "" })}
                        >
                          Remove image
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Short project description"
                      className="mt-2 min-h-[90px] resize-none"
                      value={project.description}
                      onChange={(e) => updateProject(index, { description: e.target.value })}
                    />
                    <div className="mt-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setProjects((prev) => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Images */}
            <div className="space-y-3">
              <Label>Portfolio Images</Label>
              <p className="text-sm text-muted-foreground">
                Upload up to 3 images showcasing your work (max 5MB each)
              </p>

              <div className="grid grid-cols-3 gap-4">
                {portfolioImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={img}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {portfolioImages.length < 3 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                    {uploadingImages ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                  </label>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="Or paste an image URL"
                  value={portfolioImageUrlInput}
                  onChange={(e) => setPortfolioImageUrlInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPortfolioImageUrl}
                  disabled={portfolioImages.length >= 3}
                >
                  Add URL
                </Button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Awards</h3>
                  <p className="text-xs text-muted-foreground">Highlight wins or recognitions.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAwards((prev) => [...prev, { title: "", issuer: "", year: "", description: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {awards.length === 0 && (
                <p className="text-sm text-muted-foreground">No awards added yet.</p>
              )}
              <div className="space-y-3">
                {awards.map((award, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input
                        placeholder="Award"
                        value={award.title}
                        onChange={(e) => updateAward(index, { title: e.target.value })}
                      />
                      <Input
                        placeholder="Issuer"
                        value={award.issuer}
                        onChange={(e) => updateAward(index, { issuer: e.target.value })}
                      />
                      <Input
                        placeholder="Year"
                        value={award.year}
                        onChange={(e) => updateAward(index, { year: e.target.value })}
                      />
                    </div>
                    <Textarea
                      placeholder="Short description"
                      className="mt-2 min-h-[70px] resize-none"
                      value={award.description}
                      onChange={(e) => updateAward(index, { description: e.target.value })}
                    />
                    <div className="mt-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAwards((prev) => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Certifications</h3>
                  <p className="text-xs text-muted-foreground">Add credentials or certificates.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCertifications((prev) => [...prev, { title: "", issuer: "", year: "", url: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">No certifications added yet.</p>
              )}
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Certification"
                        value={cert.title}
                        onChange={(e) => updateCertification(index, { title: e.target.value })}
                      />
                      <Input
                        placeholder="Issuer"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(index, { issuer: e.target.value })}
                      />
                      <Input
                        placeholder="Year"
                        value={cert.year}
                        onChange={(e) => updateCertification(index, { year: e.target.value })}
                      />
                      <Input
                        placeholder="Credential URL"
                        value={cert.url}
                        onChange={(e) => updateCertification(index, { url: e.target.value })}
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCertifications((prev) => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Social Links</h3>
                  <p className="text-xs text-muted-foreground">Add links people can follow.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSocialLinks((prev) => [...prev, { label: "", url: "" }])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {socialLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">No social links added yet.</p>
              )}
              <div className="space-y-3">
                {socialLinks.map((link, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] items-center">
                    <Input
                      placeholder="Label (e.g., LinkedIn)"
                      value={link.label}
                      onChange={(e) => updateSocialLink(index, { label: e.target.value })}
                    />
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSocialLinks((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-card/60 p-4">
              <div>
                <h3 className="text-base font-semibold">Contact Info</h3>
                <p className="text-xs text-muted-foreground">Control what appears on your public portfolio.</p>
              </div>
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Link or Number</FormLabel>
                    <FormControl>
                      <Input placeholder="https://wa.me/234..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Lagos, Nigeria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/freelancer")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
