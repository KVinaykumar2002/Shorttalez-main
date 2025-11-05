-- Fix RLS policies for debug_logs table to allow authenticated users to insert logs
DROP POLICY IF EXISTS "Users can insert their own debug logs" ON debug_logs;
DROP POLICY IF EXISTS "Users can view their own debug logs" ON debug_logs;
DROP POLICY IF EXISTS "Users can update their own debug logs" ON debug_logs;

-- Create more permissive policies for debug logging
CREATE POLICY "Authenticated users can insert debug logs" 
ON debug_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view debug logs" 
ON debug_logs 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update debug logs" 
ON debug_logs 
FOR UPDATE 
TO authenticated
USING (true);

-- Add a function to automatically resolve info-level logs
CREATE OR REPLACE FUNCTION auto_resolve_info_logs()
RETURNS void AS $$
BEGIN
  -- Mark info-level logs as resolved automatically
  UPDATE debug_logs 
  SET resolved = true, status = 'auto_resolved'
  WHERE level = 'info' 
    AND resolved = false 
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add improved debug stats function
CREATE OR REPLACE FUNCTION get_debug_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_logs', (SELECT COUNT(*) FROM debug_logs WHERE created_at > NOW() - INTERVAL '7 days'),
    'errors_today', (SELECT COUNT(*) FROM debug_logs WHERE level IN ('error', 'critical') AND created_at > CURRENT_DATE),
    'unresolved_errors', (SELECT COUNT(*) FROM debug_logs WHERE level IN ('error', 'critical') AND resolved = false),
    'auto_fixes_attempted', (SELECT COUNT(*) FROM auto_fix_attempts WHERE created_at > NOW() - INTERVAL '7 days'),
    'auto_fixes_successful', (SELECT COUNT(*) FROM auto_fix_attempts WHERE success = true AND created_at > NOW() - INTERVAL '7 days'),
    'log_levels', (
      SELECT json_object_agg(level, count)
      FROM (
        SELECT level, COUNT(*) as count
        FROM debug_logs 
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY level
      ) counts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;