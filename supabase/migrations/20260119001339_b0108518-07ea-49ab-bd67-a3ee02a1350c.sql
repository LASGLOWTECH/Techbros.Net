-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table access to authenticated users only
-- This fixes all 3 error-level findings about email and full_name exposure

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.uid() IS NOT NULL);