-- Fix search_path for update_global_theme function to address security warning
DROP FUNCTION IF EXISTS public.update_global_theme(TEXT);

CREATE OR REPLACE FUNCTION public.update_global_theme(theme_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN '{"success": false, "message": "Unauthorized: Admin access required"}'::JSON;
  END IF;

  -- Update global theme setting
  UPDATE public.global_settings 
  SET 
    setting_value = jsonb_build_object(
      'theme_id', theme_id,
      'set_by', auth.uid(),
      'updated_at', now()
    ),
    updated_at = now()
  WHERE setting_key = 'global_theme';

  -- Check if update was successful
  IF FOUND THEN
    result := '{"success": true, "message": "Global theme updated successfully"}'::JSON;
  ELSE
    result := '{"success": false, "message": "Failed to update global theme"}'::JSON;
  END IF;

  RETURN result;
END;
$$;