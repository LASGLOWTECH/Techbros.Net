-- Allow public to view active jobs for listings (apply still gated in UI)
DROP POLICY IF EXISTS "Authenticated users can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

CREATE POLICY "Anyone can view active jobs"
ON public.jobs FOR SELECT
USING (is_active = true);
