-- Create user-related rows after a new auth user signs up.
-- Uses metadata sent during signup: { full_name, role }.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

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
    INSERT INTO public.freelancer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
