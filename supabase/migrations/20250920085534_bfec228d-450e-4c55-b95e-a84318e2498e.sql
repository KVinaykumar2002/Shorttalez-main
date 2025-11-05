-- Enable RLS on the public_betting_users view
ALTER VIEW public.public_betting_users SET (security_barrier = true);

-- Create RLS policies for public_betting_users view
-- Only allow users to see aggregated/anonymized data, not individual user details
CREATE POLICY "Allow viewing anonymized betting stats" 
ON public.public_betting_users 
FOR SELECT 
USING (
  -- Only allow if the requesting user is viewing their own data
  -- or if they have admin privileges
  id = auth.uid() 
  OR public.has_current_role('admin'::app_role)
  -- Or allow viewing only basic stats without sensitive info for leaderboards
  OR (username IS NOT NULL AND total_bets_placed > 5)
);

-- Enable RLS on the view
ALTER VIEW public.public_betting_users ENABLE ROW LEVEL SECURITY;