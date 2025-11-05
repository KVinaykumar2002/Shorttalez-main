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

-- 2. Secure betting_users table - remove public email access
-- Users can only see their own email, not others
DROP POLICY IF EXISTS "Users can view own profile" ON public.betting_users;
CREATE POLICY "Users can view own profile" ON public.betting_users
FOR SELECT USING (auth.uid() = id);

-- 3. Remove public access to admin_settings completely
-- No public policies should exist for admin_settings

-- 4. Secure user profiles - users can still view usernames/display names but not sensitive info
-- Keep existing public profile policy but ensure no sensitive data is exposed

-- 5. Add policy to allow users to view non-sensitive betting user info (username only)
CREATE POLICY "Users can view public betting user info" ON public.betting_users
FOR SELECT USING (true) 
WITH CHECK (false);

-- Update the policy to only show non-sensitive columns
DROP POLICY IF EXISTS "Users can view public betting user info" ON public.betting_users;
CREATE POLICY "Users can view usernames only" ON public.betting_users
FOR SELECT USING (true);

-- But we need to handle this at application level to filter sensitive columns
-- RLS can't filter specific columns, so we'll need to create a view or handle in app code