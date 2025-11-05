-- Create global settings table for admin-controlled settings like themes
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage global settings
CREATE POLICY "Only admins can manage global settings"
ON public.global_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy for everyone to read global settings
CREATE POLICY "Everyone can read global settings"
ON public.global_settings
FOR SELECT
TO authenticated, anon
USING (true);

-- Insert default theme setting
INSERT INTO public.global_settings (setting_key, setting_value) 
VALUES ('global_theme', '{"theme_id": "golden", "set_by": "system", "updated_at": "2025-01-01T00:00:00Z"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update global theme (admin only)
CREATE OR REPLACE FUNCTION public.update_global_theme(theme_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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