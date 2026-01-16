import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export { supabase };

export type UserRole = "freelancer" | "client";
export type AvailabilityStatus = "available" | "busy" | "unavailable";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type FreelancerProfile = Database["public"]["Tables"]["freelancer_profiles"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

export interface FreelancerWithProfile {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role_title: string | null;
  bio: string | null;
  skills: string[];
  availability: AvailabilityStatus;
  location: string | null;
  project_link: string | null;
  portfolio_images: string[];
  is_public: boolean;
}
