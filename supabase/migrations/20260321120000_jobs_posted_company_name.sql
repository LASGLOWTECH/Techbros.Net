-- Admin job postings: allow jobs without a registered client company
ALTER TABLE public.jobs
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS posted_company_name TEXT;

COMMENT ON COLUMN public.jobs.posted_company_name IS
  'Company label for jobs not linked to client_profiles (admin-only listings).';
