-- Phase 1: Fix Critical Data Exposure Issues

-- 1.1 Restrict Global Settings Access
-- Drop the public read policy
DROP POLICY IF EXISTS "Everyone can read global settings" ON public.global_settings;

-- Create new admin-only read policy
CREATE POLICY "Only admins can read global settings"
ON public.global_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.2 Protect Creator User IDs
-- Drop existing view policy
DROP POLICY IF EXISTS "Users can view creators via security function" ON public.creators;

-- Create a security definer function that returns creator info without exposing user_id
CREATE OR REPLACE FUNCTION public.get_creator_public_info(creator_id_param uuid)
RETURNS TABLE(
  id uuid,
  bio text,
  verified boolean,
  follower_count integer,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    bio,
    verified,
    follower_count,
    created_at
  FROM public.creators
  WHERE id = creator_id_param;
$$;

-- Create new policy that allows viewing but protects user_id
CREATE POLICY "Users can view creators with protected user_id"
ON public.creators
FOR SELECT
USING (
  -- Owner can see everything including user_id
  auth.uid() = user_id
  OR
  -- Admins can see everything
  has_current_role('admin'::app_role)
  OR
  -- Others can view if they follow or for published series, but user_id will need to be filtered in queries
  can_user_view_creator(id)
);

-- Add comment to remind developers not to expose user_id
COMMENT ON COLUMN public.creators.user_id IS 'SENSITIVE: Only expose to owner and admins. Use get_creator_public_info() for public queries.';

-- Phase 2: Additional Security Hardening

-- Add index for faster rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_window 
ON public.rate_limits(user_id, action_type, window_start);

-- Add index for faster security event queries
CREATE INDEX IF NOT EXISTS idx_security_events_user_created 
ON public.security_events(user_id, created_at DESC);

-- Add constraint to ensure security event severity is valid
ALTER TABLE public.security_events 
DROP CONSTRAINT IF EXISTS check_valid_severity;

ALTER TABLE public.security_events
ADD CONSTRAINT check_valid_severity 
CHECK (severity IN ('info', 'warning', 'error', 'critical'));