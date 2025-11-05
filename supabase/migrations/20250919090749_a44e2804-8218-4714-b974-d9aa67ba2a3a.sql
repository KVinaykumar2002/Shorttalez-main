-- Fix the security definer view by recreating without security definer
DROP VIEW IF EXISTS public.public_betting_users;
CREATE VIEW public.public_betting_users 
WITH (security_invoker = true) AS 
SELECT id, username, created_at, total_bets_placed, total_winnings
FROM public.betting_users;

-- Grant access to the public view  
GRANT SELECT ON public.public_betting_users TO authenticated, anon;