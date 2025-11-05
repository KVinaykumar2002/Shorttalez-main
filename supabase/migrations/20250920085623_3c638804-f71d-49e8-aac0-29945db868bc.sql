-- Drop the existing insecure view
DROP VIEW public.public_betting_users;

-- Create a secure function that returns limited betting statistics
-- This replaces the view with controlled access
CREATE OR REPLACE FUNCTION public.get_public_betting_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE(
  username character varying,
  total_bets_placed integer,
  total_winnings numeric,
  rank_position bigint
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create a function for users to view their own betting stats
CREATE OR REPLACE FUNCTION public.get_my_betting_stats()
RETURNS TABLE(
  id uuid,
  username character varying,
  total_bets_placed integer,
  total_winnings numeric,
  wallet_balance numeric,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT 
    bu.id,
    bu.username,
    bu.total_bets_placed,
    bu.total_winnings,
    bu.wallet_balance,
    bu.created_at
  FROM betting_users bu
  WHERE bu.id = auth.uid();
$$;