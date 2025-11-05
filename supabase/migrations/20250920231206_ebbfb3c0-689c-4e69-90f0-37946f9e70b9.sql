-- CRITICAL SECURITY FIXES

-- 1. Fix Financial Data Exposure - Strengthen RLS policies for betting_users
-- Remove public access to sensitive financial data
DROP POLICY IF EXISTS "Users can view own profile" ON public.betting_users;
DROP POLICY IF EXISTS "Admins can view all betting users" ON public.betting_users;

-- Create more restrictive policies for betting_users
CREATE POLICY "Users can view own betting profile only" 
ON public.betting_users 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Admins can view all betting users" 
ON public.betting_users 
FOR SELECT 
USING (public.has_current_role('admin'::app_role));

-- Prevent any public access to financial data
CREATE POLICY "Block public financial data access" 
ON public.betting_users 
FOR SELECT 
USING (false) 
WITH CHECK (false);

-- 2. Add Privacy Controls to Posts
-- Add privacy setting column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS privacy_setting VARCHAR(20) DEFAULT 'public' CHECK (privacy_setting IN ('public', 'private', 'followers_only'));

-- Update existing posts to have explicit privacy setting
UPDATE public.posts SET privacy_setting = 'public' WHERE privacy_setting IS NULL;

-- 3. Update posts RLS policies to respect privacy settings
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

-- New privacy-aware policy for viewing posts
CREATE POLICY "Users can view posts based on privacy" 
ON public.posts 
FOR SELECT 
USING (
  -- Always allow viewing own posts
  user_id = auth.uid() 
  OR 
  -- Allow public posts for everyone
  privacy_setting = 'public'
  OR 
  -- Allow followers to see followers_only posts
  (privacy_setting = 'followers_only' AND EXISTS (
    SELECT 1 FROM public.subscriptions s
    JOIN public.creators c ON s.creator_id = c.id
    WHERE c.user_id = posts.user_id 
    AND s.follower_id = auth.uid()
  ))
  OR
  -- Allow admins to see all posts
  public.has_current_role('admin'::app_role)
);

-- 4. Secure Transactions Table - Remove public access to sensitive financial data
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions only" 
ON public.transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (public.has_current_role('admin'::app_role));

-- 5. Fix Database Function Security - Set proper search_path for existing functions
-- Update all existing functions to have secure search_path

-- Fix update_episode_likes_count function
CREATE OR REPLACE FUNCTION public.update_episode_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Handle INSERT (new like)
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'episode' AND NEW.interaction_type = 'like' THEN
            UPDATE episodes 
            SET likes = likes + 1 
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (unlike)
    IF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'episode' AND OLD.interaction_type = 'like' THEN
            UPDATE episodes 
            SET likes = GREATEST(0, likes - 1)
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.betting_users (id, email, username, wallet_balance, status, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), 0, 'active', now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 6. Email Privacy Protection - Remove email from public access
-- Add email privacy controls to betting_users
ALTER TABLE public.betting_users 
ADD COLUMN IF NOT EXISTS email_public BOOLEAN DEFAULT false;

-- Create secure function to get public user data without exposing emails
CREATE OR REPLACE FUNCTION public.get_public_user_info(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  username varchar,
  created_at timestamptz,
  total_bets_placed integer,
  total_winnings numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    bu.id,
    bu.username,
    bu.created_at,
    CASE WHEN bu.total_bets_placed > 5 THEN bu.total_bets_placed ELSE 0 END,
    CASE WHEN bu.total_bets_placed > 5 THEN bu.total_winnings ELSE 0 END
  FROM betting_users bu
  WHERE bu.id = user_uuid
    AND bu.status = 'active';
$$;

-- 7. Enhanced Security Audit Logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type varchar(50) NOT NULL,
  severity varchar(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  description text,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (public.has_current_role('admin'::app_role));

-- 8. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type varchar,
  p_severity varchar DEFAULT 'info',
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id, 
    event_type, 
    severity, 
    description, 
    metadata, 
    created_at
  ) VALUES (
    p_user_id, 
    p_event_type, 
    p_severity, 
    p_description, 
    p_metadata, 
    now()
  );
END;
$$;