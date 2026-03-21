import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export { supabase };

export type UserRole = "freelancer" | "client" | "admin";
export type AvailabilityStatus = "available" | "busy" | "unavailable";
export type JobLocationType = "remote" | "hybrid" | "onsite";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type FreelancerProfile = Database["public"]["Tables"]["freelancer_profiles"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type ClientProfile = Database["public"]["Tables"]["client_profiles"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];

export interface FreelancerWithProfile {
  user_id: string;
  full_name: string;
  email?: string | null;
  avatar_url: string | null;
  role_title: string | null;
  bio: string | null;
  about_long?: string | null;
  hero_intro?: string | null;
  hero_subtitle?: string | null;
  hero_tagline?: string | null;
  slug?: string | null;
  cv_url?: string | null;
  skill_summary?: string | null;
  services?: Array<{ title: string; description: string }>;
  experiences?: Array<{ role: string; company: string; start: string; end: string; summary: string }>;
  projects?: Array<{ title: string; description: string; url: string; image_url: string; category: string }>;
  awards?: Array<{ title: string; issuer: string; year: string; description: string }>;
  certifications?: Array<{ title: string; issuer: string; year: string; url: string }>;
  social_links?: Array<{ label: string; url: string }>;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  contact_email?: string | null;
  contact_location?: string | null;
  skills: string[];
  availability: AvailabilityStatus;
  location: string | null;
  project_link: string | null;
  portfolio_images: string[];
  is_public: boolean;
}

export interface JobWithClient {
  id: string;
  title: string;
  role: string;
  description: string;
  location_type: JobLocationType;
  location_detail?: string | null;
  reports_to?: string | null;
  application_deadline?: string | null;
  qualifications?: string | null;
  how_to_apply?: string | null;
  application_email_subject?: string | null;
  contact_email?: string | null;
  is_active: boolean;
  created_at: string;
  posted_company_name?: string | null;
  client_profiles: {
    id: string;
    company_name: string | null;
    cover_image_url: string | null;
    about: string | null;
  } | null;
}

export function jobLocationLine(job: {
  location_type: JobLocationType;
  location_detail?: string | null;
}): string {
  const labels: Record<JobLocationType, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
  };
  const base = labels[job.location_type];
  const detail = job.location_detail?.trim();
  return detail ? `${base} · ${detail}` : base;
}

export function jobDisplayCompanyName(job: {
  posted_company_name?: string | null;
  client_profiles?: { company_name?: string | null } | null;
}): string {
  const posted = job.posted_company_name?.trim();
  if (posted) return posted;
  const fromProfile = job.client_profiles?.company_name?.trim();
  if (fromProfile) return fromProfile;
  return "Company";
}
