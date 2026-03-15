-- Add slug for public freelancer profile links

CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' FROM regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_freelancer_slug(base text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug_base text;
  candidate text;
  counter int := 0;
BEGIN
  slug_base := public.slugify(base);
  IF slug_base IS NULL OR slug_base = '' THEN
    slug_base := 'freelancer';
  END IF;

  candidate := slug_base;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.freelancer_profiles WHERE slug = candidate
    );
    counter := counter + 1;
    IF counter = 1 THEN
      candidate := slug_base || '-' || substr(user_id::text, 1, 6);
    ELSE
      candidate := slug_base || '-' || substr(user_id::text, 1, 6) || '-' || counter;
    END IF;
  END LOOP;

  RETURN candidate;
END;
$$;

ALTER TABLE public.freelancer_profiles
  ADD COLUMN IF NOT EXISTS slug text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'freelancer_profiles_slug_key'
  ) THEN
    CREATE UNIQUE INDEX freelancer_profiles_slug_key ON public.freelancer_profiles (slug);
  END IF;
END $$;

UPDATE public.freelancer_profiles fp
SET slug = public.generate_unique_freelancer_slug(
  COALESCE(p.full_name, split_part(p.email, '@', 1), 'freelancer'),
  fp.user_id
)
FROM public.profiles p
WHERE fp.user_id = p.user_id AND (fp.slug IS NULL OR fp.slug = '');

UPDATE public.freelancer_profiles fp
SET slug = public.generate_unique_freelancer_slug('freelancer', fp.user_id)
WHERE fp.slug IS NULL OR fp.slug = '';

-- Ensure new users get a slug
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_text text;
  role_value public.user_role;
  display_name text;
BEGIN
  role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer');
  IF role_text NOT IN ('freelancer', 'client', 'admin') THEN
    role_text := 'freelancer';
  END IF;
  role_value := role_text::public.user_role;

  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_value)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, display_name, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;

  IF role_value = 'freelancer' THEN
    INSERT INTO public.freelancer_profiles (user_id, slug)
    VALUES (NEW.id, public.generate_unique_freelancer_slug(display_name, NEW.id))
    ON CONFLICT (user_id) DO UPDATE
    SET slug = COALESCE(public.freelancer_profiles.slug, EXCLUDED.slug);
  END IF;

  RETURN NEW;
END;
$$;
