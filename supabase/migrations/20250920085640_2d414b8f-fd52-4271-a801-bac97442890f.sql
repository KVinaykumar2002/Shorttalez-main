-- First, drop the existing view
DROP VIEW IF EXISTS public.public_betting_users;

-- Create a security definer function to return public betting stats
-- This allows us to control exactly what data is exposed
CREATE OR REPLACE FUNCTION public.get_public_betting_users()
RETURNS TABLE (
  id uuid,
  username varchar,
  created_at timestamptz,
  total_bets_placed integer,
  total_winnings numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;