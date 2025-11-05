-- SECURITY FIXES MIGRATION
-- Fix Critical and High Priority Security Issues

-- 1. Fix nullable user_id columns that have RLS dependencies
-- Make user_id NOT NULL in transactions table
ALTER TABLE public.transactions 
ALTER COLUMN user_id SET NOT NULL;

-- Make user_id NOT NULL in debug_logs where it references a user
-- First update any existing NULL user_id records to a placeholder or delete them
DELETE FROM public.debug_logs WHERE user_id IS NULL AND level IN ('error', 'critical');

-- 2. Update RLS policies for creators table - restrict public access
DROP POLICY IF EXISTS "Anyone can view creators" ON public.creators;

-- Only allow users to see creators they follow or their own creator profile
CREATE POLICY "Users can view followed creators and own profile" 
ON public.creators 
FOR SELECT 
USING (
  -- User can see their own creator profile
  auth.uid() = user_id 
  OR 
  -- User can see creators they follow
  id IN (
    SELECT creator_id FROM public.subscriptions 
    WHERE follower_id = auth.uid()
  )
  OR
  -- Admins can see all
  public.has_current_role('admin'::app_role)
);

-- 3. Update RLS policies for subscriptions table - restrict public access  
DROP POLICY IF EXISTS "Users can view subscriptions" ON public.subscriptions;

-- Only allow users to see their own subscriptions
CREATE POLICY "Users can view own subscriptions only" 
ON public.subscriptions 
FOR SELECT 
USING (
  -- User can see subscriptions they created (following)
  auth.uid() = follower_id 
  OR 
  -- User can see who follows them (if they are a creator)
  creator_id IN (
    SELECT id FROM public.creators WHERE user_id = auth.uid()
  )
  OR
  -- Admins can see all
  public.has_current_role('admin'::app_role)
);

-- 4. Fix debug logs anonymous insertion - remove overly permissive policies
DROP POLICY IF EXISTS "Allow anonymous debug log inserts" ON public.debug_logs;
DROP POLICY IF EXISTS "Debug logs can be inserted by anyone" ON public.debug_logs;

-- Only allow authenticated users to insert debug logs
CREATE POLICY "Authenticated users can insert debug logs" 
ON public.debug_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Update database functions to have proper search_path settings
-- Update functions that are missing explicit search_path

CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.creators 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.creator_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.creators 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.creator_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_interaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      CASE NEW.interaction_type
        WHEN 'like' THEN
          UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
        WHEN 'reshare' THEN
          UPDATE public.posts SET reshares_count = reshares_count + 1 WHERE id = NEW.target_id;
      END CASE;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      CASE OLD.interaction_type
        WHEN 'like' THEN
          UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
        WHEN 'reshare' THEN
          UPDATE public.posts SET reshares_count = GREATEST(reshares_count - 1, 0) WHERE id = OLD.target_id;
      END CASE;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_betting_stats(user_uuid uuid DEFAULT NULL::uuid)
RETURNS TABLE(total_users integer, total_bets integer, total_volume numeric, user_bets integer, user_winnings numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Input validation
    IF user_uuid IS NOT NULL AND user_uuid = '00000000-0000-0000-0000-000000000000'::uuid THEN
        RAISE EXCEPTION 'Invalid user UUID provided';
    END IF;
    
    -- Get overall stats
    SELECT 
        COUNT(DISTINCT bu.id),
        COUNT(b.id),
        COALESCE(SUM(b.amount), 0)
    INTO total_users, total_bets, total_volume
    FROM public.betting_users bu
    LEFT JOIN public.bets b ON bu.id = b.user_id;
    
    -- Get user-specific stats if user_uuid provided
    IF user_uuid IS NOT NULL THEN
        SELECT 
            COUNT(b.id),
            COALESCE(SUM(t.amount), 0)
        INTO user_bets, user_winnings
        FROM public.betting_users bu
        LEFT JOIN public.bets b ON bu.id = b.user_id
        LEFT JOIN public.transactions t ON bu.id = t.user_id AND t.transaction_type = 'win'
        WHERE bu.id = user_uuid;
    ELSE
        user_bets := 0;
        user_winnings := 0;
    END IF;
    
    RETURN NEXT;
END;
$function$;

-- 6. Add input validation to betting functions
CREATE OR REPLACE FUNCTION public.mock_deposit(amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
  new_balance numeric;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Enhanced input validation
  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF amount > 100000 THEN
    RAISE EXCEPTION 'Amount exceeds maximum deposit limit';
  END IF;

  UPDATE public.betting_users
  SET wallet_balance = wallet_balance + amount,
      updated_at = now()
  WHERE id = uid
  RETURNING wallet_balance INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in betting system';
  END IF;

  INSERT INTO public.transactions (user_id, transaction_type, amount, description, created_at, status)
  VALUES (uid, 'deposit', amount, 'Mock deposit', now(), 'completed');

  RETURN json_build_object('new_balance', new_balance);
END;
$function$;

-- 7. Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type varchar NOT NULL,
  target_table varchar,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.has_current_role('admin'::app_role));

-- 8. Add security constraint to prevent self-following
ALTER TABLE public.subscriptions 
ADD CONSTRAINT no_self_follow 
CHECK (follower_id != creator_id);

-- 9. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type varchar NOT NULL,
  ip_address inet,
  attempts integer DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only users can see their own rate limit records
CREATE POLICY "Users can view own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);

-- 10. Update comment insertion to include better validation
CREATE OR REPLACE FUNCTION public.validate_comment_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Basic content validation
  IF LENGTH(TRIM(NEW.content)) < 1 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  IF LENGTH(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Comment content exceeds maximum length';
  END IF;
  
  -- Remove potential XSS patterns (basic)
  NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
  NEW.content := regexp_replace(NEW.content, 'javascript:', '', 'gi');
  NEW.content := regexp_replace(NEW.content, 'vbscript:', '', 'gi');
  NEW.content := regexp_replace(NEW.content, 'on\w+\s*=', '', 'gi');
  
  RETURN NEW;
END;
$function$;

-- Add trigger for comment validation
DROP TRIGGER IF EXISTS validate_comment_content_trigger ON public.comments;
CREATE TRIGGER validate_comment_content_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.validate_comment_content();