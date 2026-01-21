import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Building2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const profileSchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  about: z.string().max(1000, "About must be less than 1000 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompanyProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: "",
      about: "",
      website: "",
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
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setClientProfileId(data.id);
      setCoverImage(data.cover_image_url);
      form.reset({
        company_name: data.company_name || "",
        about: data.about || "",
        website: data.website || "",
      });
    }
    setLoading(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // Delete old cover if exists
    if (coverImage) {
      const oldPath = coverImage.split("/").slice(-2).join("/");
      await supabase.storage.from("client-covers").remove([oldPath]);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("client-covers")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("client-covers")
      .getPublicUrl(fileName);

    setCoverImage(urlData.publicUrl);
    setUploading(false);

    toast({
      title: "Cover uploaded",
      description: "Your cover image has been updated.",
    });
  };

  const handleRemoveCover = async () => {
    if (!coverImage || !user) return;

    const oldPath = coverImage.split("/").slice(-2).join("/");
    await supabase.storage.from("client-covers").remove([oldPath]);
    setCoverImage(null);

    toast({
      title: "Cover removed",
      description: "Your cover image has been removed.",
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSaving(true);

    const profileData = {
      user_id: user.id,
      company_name: data.company_name,
      about: data.about || null,
      website: data.website || null,
      cover_image_url: coverImage,
      updated_at: new Date().toISOString(),
    };

    const { data: upsertedData, error } = await supabase
      .from("client_profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setClientProfileId(upsertedData.id);
      toast({
        title: "Profile saved",
        description: "Your company profile has been updated.",
      });
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
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/client")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Company Profile</h1>
        <p className="text-muted-foreground mb-8">
          Set up your company information visible to freelancers
        </p>

        {/* Cover Image */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
            <CardDescription>
              Upload a banner image for your company profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {coverImage ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={coverImage}
                    alt="Company cover"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveCover}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload cover image
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max 5MB, recommended 1200x400px
                      </span>
                    </>
                  )}
                </label>
              )}
              {coverImage && (
                <label className="mt-3 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button variant="outline" className="w-full" asChild disabled={uploading}>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Change Cover Image
                    </span>
                  </Button>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Company Information</CardTitle>
            </div>
            <CardDescription>
              Tell freelancers about your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell freelancers about your company, culture, and what you do..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/client")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}