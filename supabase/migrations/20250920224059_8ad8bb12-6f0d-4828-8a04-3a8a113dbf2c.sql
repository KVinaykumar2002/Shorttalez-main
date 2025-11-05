-- Create trigger function to auto-generate movie avatar for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_movie_avatar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert basic profile first
  INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  -- Call the edge function to generate movie avatar (async)
  PERFORM
    net.http_post(
      url := 'https://nxsogkmnimaihoxbpnpd.supabase.co/functions/v1/generate-movie-avatar',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'userId', NEW.id::text,
        'userEmail', NEW.email
      )
    );

  RETURN NEW;
END;
$$;

-- Create the trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_movie_avatar ON auth.users;
CREATE TRIGGER on_auth_user_created_movie_avatar
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_movie_avatar();

-- Update existing users without avatars to get movie avatars
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au 
    LEFT JOIN public.profiles p ON au.id = p.id 
    WHERE p.avatar_url IS NULL OR p.avatar_url = ''
  LOOP
    -- Call the edge function for existing users
    PERFORM
      net.http_post(
        url := 'https://nxsogkmnimaihoxbpnpd.supabase.co/functions/v1/generate-movie-avatar',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'userId', user_record.id::text,
          'userEmail', user_record.email
        )
      );
  END LOOP;
END $$;