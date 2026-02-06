-- Add foreign key relationship between freelancer_profiles and profiles
-- First, we need to link freelancer_profiles.user_id to profiles.user_id

-- Add a foreign key constraint from freelancer_profiles to profiles
ALTER TABLE public.freelancer_profiles 
ADD CONSTRAINT freelancer_profiles_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;