-- Create a secure public view for non-sensitive betting user data
CREATE OR REPLACE VIEW public.public_betting_users AS 
SELECT id, username, created_at, total_bets_placed, total_winnings
FROM public.betting_users;

-- Grant access to the public view  
GRANT SELECT ON public.public_betting_users TO authenticated, anon;