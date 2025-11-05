-- Fix function search path security issues
-- Update functions that don't have search_path set to be more secure

-- Fix get_public_betting_users function
CREATE OR REPLACE FUNCTION public.get_public_betting_users()
 RETURNS TABLE(id uuid, username character varying, created_at timestamp with time zone, total_bets_placed integer, total_winnings numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only return data for users with significant activity to protect privacy
  -- and only basic stats without exposing sensitive information
  RETURN QUERY
  SELECT 
    bu.id,
    bu.username,
    bu.created_at,
    bu.total_bets_placed,
    bu.total_winnings
  FROM betting_users bu
  WHERE 
    -- Only show users with some betting activity to maintain privacy
    bu.total_bets_placed > 0
    -- Users can see their own data
    AND (bu.id = auth.uid() 
         -- Admins can see all data
         OR public.has_current_role('admin'::app_role)
         -- Or for leaderboard purposes, show top performers only
         OR bu.total_winnings > 100);
END;
$function$;

-- Fix get_public_betting_leaderboard function  
CREATE OR REPLACE FUNCTION public.get_public_betting_leaderboard(limit_count integer DEFAULT 10)
 RETURNS TABLE(username character varying, total_bets_placed integer, total_winnings numeric, rank_position bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    bu.username,
    bu.total_bets_placed,
    bu.total_winnings,
    ROW_NUMBER() OVER (ORDER BY bu.total_winnings DESC, bu.total_bets_placed DESC) as rank_position
  FROM betting_users bu
  WHERE bu.status = 'active' 
    AND bu.total_bets_placed >= 5  -- Only show users with meaningful activity
    AND bu.username IS NOT NULL
  ORDER BY bu.total_winnings DESC, bu.total_bets_placed DESC
  LIMIT limit_count;
$function$;

-- Fix get_public_profile_info function
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_id uuid)
 RETURNS TABLE(id uuid, username character varying, display_name character varying, bio text, avatar_url text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.created_at
  FROM profiles p
  WHERE p.id = profile_id;
$function$;

-- Fix get_my_betting_stats function
CREATE OR REPLACE FUNCTION public.get_my_betting_stats()
 RETURNS TABLE(id uuid, username character varying, total_bets_placed integer, total_winnings numeric, wallet_balance numeric, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    bu.id,
    bu.username,
    bu.total_bets_placed,
    bu.total_winnings,
    bu.wallet_balance,
    bu.created_at
  FROM betting_users bu
  WHERE bu.id = auth.uid();
$function$;

-- Fix can_user_view_creator function
CREATE OR REPLACE FUNCTION public.can_user_view_creator(creator_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    -- User can see their own creator profile
    SELECT 1 FROM public.creators WHERE id = creator_id_param AND user_id = auth.uid()
  )
  OR EXISTS (
    -- User can see creators they follow
    SELECT 1 FROM public.subscriptions 
    WHERE creator_id = creator_id_param AND follower_id = auth.uid()
  )
  OR (
    -- Admins can see all
    public.has_current_role('admin'::app_role)
  )
  OR (
    -- For published series, allow public viewing of creators
    EXISTS (
      SELECT 1 FROM public.series 
      WHERE creator_id = creator_id_param AND status = 'published'
    )
  );
$function$;