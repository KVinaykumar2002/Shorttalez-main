-- Fix critical security vulnerabilities by restricting public access to sensitive data

-- 1. Fix profiles table - restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Fix interactions table - users can only see their own interactions
DROP POLICY IF EXISTS "Users can view interactions" ON interactions;
CREATE POLICY "Users can view own interactions" 
ON interactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Fix comments table - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Authenticated users can view comments" 
ON comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();