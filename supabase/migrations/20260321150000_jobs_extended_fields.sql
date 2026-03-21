-- Richer job postings (location text, reporting line, deadline, requirements, apply instructions)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_detail TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS reports_to TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_deadline DATE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS how_to_apply TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_email_subject TEXT;

COMMENT ON COLUMN public.jobs.location_detail IS 'City, state, or region (e.g. Abuja FCT, Sango-Ota Ogun).';
COMMENT ON COLUMN public.jobs.reports_to IS 'Who the role reports to (title / name).';
COMMENT ON COLUMN public.jobs.application_deadline IS 'Last date to apply.';
COMMENT ON COLUMN public.jobs.qualifications IS 'Education, languages, experience, competencies.';
COMMENT ON COLUMN public.jobs.how_to_apply IS 'CV, cover letter, subject line, notes for applicants.';
COMMENT ON COLUMN public.jobs.application_email_subject IS 'Preferred email subject; defaults to job title in UI if empty.';
