-- Restrict contact_email to authenticated users only
GRANT SELECT ON public.jobs TO anon, authenticated;
REVOKE SELECT (contact_email) ON public.jobs FROM anon;
GRANT SELECT (contact_email) ON public.jobs TO authenticated;
