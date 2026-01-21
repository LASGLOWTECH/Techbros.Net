-- Create enum for job location type
CREATE TYPE public.job_location_type AS ENUM ('remote', 'hybrid', 'onsite');

-- Create client_profiles table for company information
CREATE TABLE public.client_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    company_name TEXT,
    about TEXT,
    cover_image_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_profiles
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_profiles
CREATE POLICY "Anyone can view client profiles"
ON public.client_profiles
FOR SELECT
USING (true);

CREATE POLICY "Clients can insert their own profile"
ON public.client_profiles
FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND has_role(auth.uid(), 'client'::user_role));

CREATE POLICY "Clients can update their own profile"
ON public.client_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    location_type job_location_type NOT NULL DEFAULT 'remote',
    contact_email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (is_active = true);

CREATE POLICY "Clients can view their own jobs"
ON public.jobs
FOR SELECT
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can insert jobs"
ON public.jobs
FOR INSERT
WITH CHECK (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can update their own jobs"
ON public.jobs
FOR UPDATE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Clients can delete their own jobs"
ON public.jobs
FOR DELETE
USING (client_id IN (SELECT id FROM public.client_profiles WHERE user_id = auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_client_profiles_updated_at
BEFORE UPDATE ON public.client_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for client cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('client-covers', 'client-covers', true);

-- Storage policies for client covers
CREATE POLICY "Client cover images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-covers');

CREATE POLICY "Clients can upload their own cover images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'client-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clients can update their own cover images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'client-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clients can delete their own cover images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-covers' AND auth.uid()::text = (storage.foldername(name))[1]);