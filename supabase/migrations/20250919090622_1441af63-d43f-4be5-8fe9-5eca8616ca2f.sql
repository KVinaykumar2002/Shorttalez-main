-- Fix CRITICAL security vulnerabilities

-- 1. Fix broken admin policies - replace 'true' with proper role checks
DROP POLICY IF EXISTS "Admin can view all settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin can update all settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admin can view all users" ON public.betting_users;
DROP POLICY IF EXISTS "Admin can update all users" ON public.betting_users;
DROP POLICY IF EXISTS "Admin can view all bets" ON public.bets;
DROP POLICY IF EXISTS "Admin can update all bets" ON public.bets;
DROP POLICY IF EXISTS "Admin can view all rounds" ON public.game_rounds;
DROP POLICY IF EXISTS "Admin can update all rounds" ON public.game_rounds;
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.bets;

-- Create secure admin policies using proper role checks
CREATE POLICY "Admins can view admin settings" ON public.admin_settings
FOR SELECT USING (public.has_current_role('admin'));

CREATE POLICY "Admins can update admin settings" ON public.admin_settings
FOR UPDATE USING (public.has_current_role('admin'));

CREATE POLICY "Admins can view all betting users" ON public.betting_users
FOR SELECT USING (public.has_current_role('admin'));

CREATE POLICY "Admins can update all betting users" ON public.betting_users
FOR UPDATE USING (public.has_current_role('admin'));

CREATE POLICY "Admins can view all bets" ON public.bets
FOR SELECT USING (public.has_current_role('admin'));

CREATE POLICY "Admins can update all bets" ON public.bets
FOR UPDATE USING (public.has_current_role('admin'));

CREATE POLICY "Admins can view all game rounds" ON public.game_rounds
FOR SELECT USING (public.has_current_role('admin'));

CREATE POLICY "Admins can update all game rounds" ON public.game_rounds
FOR UPDATE USING (public.has_current_role('admin'));

-- 2. Secure betting_users table - users can only see their own profile data
DROP POLICY IF EXISTS "Users can view own profile" ON public.betting_users;
CREATE POLICY "Users can view own profile" ON public.betting_users
FOR SELECT USING (auth.uid() = id);

-- 3. Create a public view for non-sensitive betting user data (username only)
DROP VIEW IF EXISTS public.public_betting_users;
CREATE VIEW public.public_betting_users AS 
SELECT id, username, created_at 
FROM public.betting_users;

-- Enable RLS on the view
ALTER VIEW public.public_betting_users SET (security_invoker = on);

-- Grant access to the public view
GRANT SELECT ON public.public_betting_users TO authenticated, anon;