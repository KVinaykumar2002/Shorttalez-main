-- CRITICAL SECURITY FIXES - CORRECTED VERSION

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

-- 5. Email Privacy Protection - Remove email from public access
-- Add email privacy controls to betting_users
ALTER TABLE public.betting_users 
ADD COLUMN IF NOT EXISTS email_public BOOLEAN DEFAULT false;