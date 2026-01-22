-- =============================================
-- STEP 1: ADD 'admin' TO THE user_role ENUM
-- This must be in its own transaction/migration
-- =============================================
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';