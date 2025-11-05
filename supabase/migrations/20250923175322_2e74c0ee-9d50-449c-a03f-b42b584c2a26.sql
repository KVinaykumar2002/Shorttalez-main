-- Add comprehensive input validation to all functions that still need it
-- Fix any remaining search_path issues

-- Enhanced rate limiting function with better security
CREATE OR REPLACE FUNCTION public.check_rate_limit(action_type_param character varying, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  current_attempts integer;
  user_id_param uuid := auth.uid();
BEGIN
  -- Input validation
  IF action_type_param IS NULL OR LENGTH(TRIM(action_type_param)) = 0 THEN
    RAISE EXCEPTION 'Action type cannot be empty';
  END IF;
  
  IF max_attempts <= 0 OR max_attempts > 1000 THEN
    RAISE EXCEPTION 'Invalid max_attempts: must be between 1 and 1000';
  END IF;
  
  IF window_minutes <= 0 OR window_minutes > 1440 THEN
    RAISE EXCEPTION 'Invalid window_minutes: must be between 1 and 1440';
  END IF;
  
  -- Count recent attempts
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE user_id = user_id_param
    AND action_type = action_type_param
    AND window_start > now() - INTERVAL '1 minute' * window_minutes;
  
  -- If under limit, record this attempt
  IF current_attempts < max_attempts THEN
    INSERT INTO public.rate_limits (user_id, action_type, attempts, window_start)
    VALUES (user_id_param, action_type_param, 1, now())
    ON CONFLICT (user_id, action_type) 
    DO UPDATE SET 
      attempts = rate_limits.attempts + 1,
      window_start = CASE 
        WHEN rate_limits.window_start < now() - INTERVAL '1 minute' * window_minutes 
        THEN now() 
        ELSE rate_limits.window_start 
      END;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type character varying, p_severity character varying DEFAULT 'info'::character varying, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Input validation
  IF p_event_type IS NULL OR LENGTH(TRIM(p_event_type)) = 0 THEN
    RAISE EXCEPTION 'Event type cannot be empty';
  END IF;
  
  IF p_severity NOT IN ('info', 'warning', 'error', 'critical') THEN
    RAISE EXCEPTION 'Invalid severity level';
  END IF;
  
  INSERT INTO public.security_events (
    user_id, 
    event_type, 
    severity, 
    description, 
    metadata, 
    created_at
  ) VALUES (
    p_user_id, 
    p_event_type, 
    p_severity, 
    p_description, 
    p_metadata, 
    now()
  );
END;
$function$;

-- Add comprehensive cleanup function
CREATE OR REPLACE FUNCTION public.comprehensive_cleanup()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  cleaned_logs integer := 0;
  cleaned_rate_limits integer := 0;
  cleaned_security_events integer := 0;
  result json;
BEGIN
  -- Only allow admins to run cleanup
  IF NOT public.has_current_role('admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Clean old debug logs (older than 90 days)
  DELETE FROM public.debug_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS cleaned_logs = ROW_COUNT;
  
  -- Clean old rate limit records (older than 24 hours)
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS cleaned_rate_limits = ROW_COUNT;
  
  -- Clean old security events (older than 180 days, keep critical ones for 1 year)
  DELETE FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '180 days'
    AND severity != 'critical';
  
  DELETE FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '1 year'
    AND severity = 'critical';
  GET DIAGNOSTICS cleaned_security_events = ROW_COUNT;
  
  -- Build result
  SELECT json_build_object(
    'success', true,
    'cleaned_logs', cleaned_logs,
    'cleaned_rate_limits', cleaned_rate_limits,
    'cleaned_security_events', cleaned_security_events,
    'cleanup_time', now()
  ) INTO result;
  
  RETURN result;
END;
$function$;