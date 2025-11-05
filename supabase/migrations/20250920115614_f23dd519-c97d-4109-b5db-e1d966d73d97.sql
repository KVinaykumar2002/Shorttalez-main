-- Create debug system tables
CREATE TYPE public.log_level AS ENUM ('debug', 'info', 'warn', 'error', 'critical');
CREATE TYPE public.log_status AS ENUM ('new', 'reviewing', 'fixing', 'fixed', 'ignored');

-- Debug logs table to store all application logs
CREATE TABLE public.debug_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level log_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'frontend',
  additional_data JSONB,
  session_id TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  status log_status DEFAULT 'new',
  auto_fix_attempted BOOLEAN DEFAULT FALSE,
  auto_fix_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Debug settings table for admin configuration
CREATE TABLE public.debug_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debug_mode_enabled BOOLEAN DEFAULT FALSE,
  auto_fix_enabled BOOLEAN DEFAULT FALSE,
  log_retention_days INTEGER DEFAULT 30,
  max_logs_per_session INTEGER DEFAULT 1000,
  auto_fix_confidence_threshold NUMERIC DEFAULT 0.8,
  allowed_log_levels log_level[] DEFAULT ARRAY['error'::log_level, 'critical'::log_level],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-fix attempts table to track AI fixing attempts
CREATE TABLE public.auto_fix_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debug_log_id UUID NOT NULL REFERENCES public.debug_logs(id) ON DELETE CASCADE,
  fix_suggestion TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  applied BOOLEAN DEFAULT FALSE,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_fix_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debug_logs
CREATE POLICY "Admins can view all debug logs" 
ON public.debug_logs 
FOR SELECT 
USING (has_current_role('admin'::app_role));

CREATE POLICY "Anyone can insert debug logs" 
ON public.debug_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update debug logs" 
ON public.debug_logs 
FOR UPDATE 
USING (has_current_role('admin'::app_role));

CREATE POLICY "Admins can delete debug logs" 
ON public.debug_logs 
FOR DELETE 
USING (has_current_role('admin'::app_role));

-- RLS Policies for debug_settings
CREATE POLICY "Admins can manage debug settings" 
ON public.debug_settings 
FOR ALL 
USING (has_current_role('admin'::app_role));

-- RLS Policies for auto_fix_attempts
CREATE POLICY "Admins can manage auto fix attempts" 
ON public.auto_fix_attempts 
FOR ALL 
USING (has_current_role('admin'::app_role));

-- Insert default debug settings
INSERT INTO public.debug_settings (debug_mode_enabled, auto_fix_enabled, log_retention_days, max_logs_per_session, auto_fix_confidence_threshold, allowed_log_levels)
VALUES (false, false, 30, 1000, 0.8, ARRAY['error'::log_level, 'critical'::log_level]);

-- Create indexes for better performance
CREATE INDEX idx_debug_logs_timestamp ON public.debug_logs(timestamp DESC);
CREATE INDEX idx_debug_logs_level ON public.debug_logs(level);
CREATE INDEX idx_debug_logs_status ON public.debug_logs(status);
CREATE INDEX idx_debug_logs_user_id ON public.debug_logs(user_id);
CREATE INDEX idx_debug_logs_resolved ON public.debug_logs(resolved);

-- Create function to clean up old logs
CREATE OR REPLACE FUNCTION public.cleanup_old_debug_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  retention_days INTEGER;
BEGIN
  -- Get retention setting
  SELECT log_retention_days INTO retention_days 
  FROM public.debug_settings 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF retention_days IS NULL THEN
    retention_days := 30;
  END IF;
  
  -- Delete old logs
  DELETE FROM public.debug_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
END;
$$;

-- Create function to get debug statistics
CREATE OR REPLACE FUNCTION public.get_debug_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_logs', (SELECT COUNT(*) FROM public.debug_logs),
    'errors_today', (SELECT COUNT(*) FROM public.debug_logs WHERE level IN ('error', 'critical') AND DATE(created_at) = CURRENT_DATE),
    'unresolved_errors', (SELECT COUNT(*) FROM public.debug_logs WHERE resolved = false AND level IN ('error', 'critical')),
    'auto_fixes_attempted', (SELECT COUNT(*) FROM public.auto_fix_attempts),
    'auto_fixes_successful', (SELECT COUNT(*) FROM public.auto_fix_attempts WHERE success = true),
    'log_levels', (
      SELECT json_object_agg(level, count)
      FROM (
        SELECT level, COUNT(*) as count
        FROM public.debug_logs
        WHERE DATE(created_at) = CURRENT_DATE
        GROUP BY level
      ) level_counts
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_debug_logs_updated_at
  BEFORE UPDATE ON public.debug_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debug_settings_updated_at
  BEFORE UPDATE ON public.debug_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_fix_attempts_updated_at
  BEFORE UPDATE ON public.auto_fix_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for debug_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.debug_logs;
ALTER TABLE public.debug_logs REPLICA IDENTITY FULL;