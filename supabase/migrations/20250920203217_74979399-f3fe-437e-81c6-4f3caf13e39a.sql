-- Fix debug_logs RLS policy to allow anonymous logging for better error tracking
-- This will help capture errors even when users are not authenticated

-- First, add a policy to allow anonymous inserts for debug logging
CREATE POLICY "Allow anonymous debug log inserts" 
ON public.debug_logs 
FOR INSERT 
WITH CHECK (true);

-- Update the existing insert policy to be more permissive for debugging
DROP POLICY IF EXISTS "Anyone can insert debug logs" ON public.debug_logs;

-- Create a new policy that allows both authenticated and anonymous users to insert debug logs
CREATE POLICY "Debug logs can be inserted by anyone" 
ON public.debug_logs 
FOR INSERT 
WITH CHECK (true);

-- Add index for better performance on debug log queries
CREATE INDEX IF NOT EXISTS idx_debug_logs_created_at ON public.debug_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debug_logs_level ON public.debug_logs(level);
CREATE INDEX IF NOT EXISTS idx_debug_logs_resolved ON public.debug_logs(resolved) WHERE resolved = false;