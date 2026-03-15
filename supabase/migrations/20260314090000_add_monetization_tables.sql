-- Monetization tables: credits, trials, promos, and unlocks

-- Credits wallet per user
CREATE TABLE public.credits_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credit transactions (purchases and spends)
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'spend')),
  ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ref)
);

-- Premium trial per user
CREATE TABLE public.premium_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unlocks for expert contact (per client)
CREATE TABLE public.contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expert_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, expert_id)
);

-- Promo codes
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  credit_bonus integer NOT NULL DEFAULT 0 CHECK (credit_bonus >= 0),
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  expires_at timestamptz,
  max_redemptions integer CHECK (max_redemptions IS NULL OR max_redemptions >= 0),
  used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Promo redemptions per user
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id uuid REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(promo_id, user_id)
);

-- Enable RLS
ALTER TABLE public.credits_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Credits wallet policies
CREATE POLICY "Users can view their own credits wallet"
ON public.credits_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits wallet"
ON public.credits_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits wallet"
ON public.credits_wallets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credits wallets"
ON public.credits_wallets FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Credit transactions policies
CREATE POLICY "Users can view their own credit transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all credit transactions"
ON public.credit_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Premium trials policies
CREATE POLICY "Users can view their own trials"
ON public.premium_trials FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trials"
ON public.premium_trials FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Contact unlocks policies
CREATE POLICY "Users can view their own unlocks"
ON public.contact_unlocks FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all unlocks"
ON public.contact_unlocks FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Promo codes policies (admin only)
CREATE POLICY "Admins can view promo codes"
ON public.promo_codes FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can create promo codes"
ON public.promo_codes FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update promo codes"
ON public.promo_codes FOR UPDATE
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can delete promo codes"
ON public.promo_codes FOR DELETE
USING (has_role(auth.uid(), 'admin'::user_role));

-- Promo redemptions policies
CREATE POLICY "Users can view their own promo redemptions"
ON public.promo_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all promo redemptions"
ON public.promo_redemptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Updated_at trigger for credits wallets
CREATE TRIGGER update_credits_wallets_updated_at
BEFORE UPDATE ON public.credits_wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
