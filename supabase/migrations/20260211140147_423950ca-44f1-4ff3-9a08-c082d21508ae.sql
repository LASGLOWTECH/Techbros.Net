
-- Fix: Create agencies table without referencing agency_members in policies first
-- Then create agency_members, then add the cross-referencing policies

-- Agencies table (policies that reference agency_members will be added after)
CREATE TABLE IF NOT EXISTS public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Simple owner policy first (no cross-reference)
CREATE POLICY "Agency owners can view their agency" ON public.agencies
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Agency owners can update their agency" ON public.agencies
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Authenticated users can create agencies" ON public.agencies
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can view all agencies" ON public.agencies
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Admins can delete agencies" ON public.agencies
  FOR DELETE USING (has_role(auth.uid(), 'admin'::user_role));

-- Agency Members
CREATE TABLE IF NOT EXISTS public.agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id, user_id)
);
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view their team" ON public.agency_members
  FOR SELECT USING (
    agency_id IN (SELECT am.agency_id FROM public.agency_members am WHERE am.user_id = auth.uid())
  );
CREATE POLICY "Agency owners/admins can insert members" ON public.agency_members
  FOR INSERT WITH CHECK (
    agency_id IN (
      SELECT am.agency_id FROM public.agency_members am
      WHERE am.user_id = auth.uid() AND am.role IN ('owner', 'admin')
    )
    OR
    agency_id IN (SELECT a.id FROM public.agencies a WHERE a.owner_id = auth.uid())
  );
CREATE POLICY "Agency owners can delete members" ON public.agency_members
  FOR DELETE USING (
    agency_id IN (
      SELECT am.agency_id FROM public.agency_members am
      WHERE am.user_id = auth.uid() AND am.role = 'owner'
    )
  );
CREATE POLICY "Admins can view all members" ON public.agency_members
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

-- Now add the cross-referencing policy for agencies (members can view)
CREATE POLICY "Agency members can view their agency" ON public.agencies
  FOR SELECT USING (
    id IN (SELECT am.agency_id FROM public.agency_members am WHERE am.user_id = auth.uid())
  );

-- Saved Candidates
CREATE TABLE IF NOT EXISTS public.saved_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agency_id, expert_id)
);
ALTER TABLE public.saved_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agency members can view saved candidates" ON public.saved_candidates
  FOR SELECT USING (
    agency_id IN (SELECT am.agency_id FROM public.agency_members am WHERE am.user_id = auth.uid())
  );
CREATE POLICY "Agency members can save candidates" ON public.saved_candidates
  FOR INSERT WITH CHECK (
    agency_id IN (SELECT am.agency_id FROM public.agency_members am WHERE am.user_id = auth.uid())
    AND saved_by = auth.uid()
  );
CREATE POLICY "Agency members can remove candidates" ON public.saved_candidates
  FOR DELETE USING (
    agency_id IN (SELECT am.agency_id FROM public.agency_members am WHERE am.user_id = auth.uid())
  );
CREATE POLICY "Admins can view all saved candidates" ON public.saved_candidates
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));
