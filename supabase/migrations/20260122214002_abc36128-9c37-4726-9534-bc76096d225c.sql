-- =============================================
-- 1. CREATE ADMIN_ACTIONS TABLE FOR AUDIT LOGGING
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin actions
CREATE POLICY "Admins can view all admin actions"
ON public.admin_actions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert admin actions
CREATE POLICY "Admins can create admin actions"
ON public.admin_actions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- =============================================
-- 2. ADD is_suspended COLUMN TO profiles TABLE
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- =============================================
-- 3. FIX SECURITY ISSUE: UPDATE PROFILES RLS POLICIES
-- =============================================
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Public freelancer profiles are viewable by authenticated users
CREATE POLICY "Public freelancer profiles are viewable"
ON public.profiles FOR SELECT
USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
        SELECT user_id FROM public.freelancer_profiles WHERE is_public = true
    )
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. FIX SECURITY ISSUE: UPDATE JOBS RLS POLICIES
-- =============================================
-- Drop the existing public policy
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

-- Only authenticated users can view active jobs
CREATE POLICY "Authenticated users can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Admins can view all jobs (including inactive)
CREATE POLICY "Admins can view all jobs"
ON public.jobs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any job
CREATE POLICY "Admins can update any job"
ON public.jobs FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any job
CREATE POLICY "Admins can delete any job"
ON public.jobs FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. ADD ADMIN POLICIES TO OTHER TABLES
-- =============================================
-- Admins can view all user_roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update user_roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete user_roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all freelancer_profiles
CREATE POLICY "Admins can view all freelancer profiles"
ON public.freelancer_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any freelancer_profile
CREATE POLICY "Admins can update any freelancer profile"
ON public.freelancer_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any freelancer_profile
CREATE POLICY "Admins can delete any freelancer profile"
ON public.freelancer_profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all client_profiles
CREATE POLICY "Admins can view all client profiles"
ON public.client_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any client_profile
CREATE POLICY "Admins can update any client profile"
ON public.client_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete any client_profile
CREATE POLICY "Admins can delete any client profile"
ON public.client_profiles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all bookmarks
CREATE POLICY "Admins can view all bookmarks"
ON public.bookmarks FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));