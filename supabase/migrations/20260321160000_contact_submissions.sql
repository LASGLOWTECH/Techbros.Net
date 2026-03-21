-- Contact form messages (stored in DB; admins read in dashboard)
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(both FROM email)) > 3
  AND position('@' IN trim(both FROM email)) > 1
  AND length(trim(both FROM message)) >= 10
  AND length(trim(both FROM message)) <= 8000
  AND (user_id IS NULL OR user_id = auth.uid())
  AND (full_name IS NULL OR length(trim(both FROM full_name)) <= 200)
  AND (subject IS NULL OR length(trim(both FROM subject)) <= 300)
);

CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_submissions TO authenticated;
