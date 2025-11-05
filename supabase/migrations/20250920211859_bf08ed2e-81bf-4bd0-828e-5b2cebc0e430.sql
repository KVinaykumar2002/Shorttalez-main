-- FIX INFINITE RECURSION IN CREATORS POLICY
-- The issue is caused by the RLS policy referencing the same table it's protecting

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view followed creators and own profile" ON public.creators;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.can_user_view_creator(creator_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create a much simpler policy using the security definer function
CREATE POLICY "Users can view creators via security function" 
ON public.creators 
FOR SELECT 
USING (public.can_user_view_creator(id));

-- Also fix the subscriptions policy to be simpler and avoid recursion
DROP POLICY IF EXISTS "Users can view own subscriptions only" ON public.subscriptions;

-- Create a simpler policy for subscriptions
CREATE POLICY "Users can view relevant subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (
  -- User can see subscriptions they created (following)
  auth.uid() = follower_id 
  OR 
  -- Creators can see who follows them (but use a direct lookup)
  EXISTS (
    SELECT 1 FROM public.creators 
    WHERE id = subscriptions.creator_id AND user_id = auth.uid()
  )
  OR
  -- Admins can see all
  public.has_current_role('admin'::app_role)
);