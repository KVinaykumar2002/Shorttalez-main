-- Fix database function search path security warnings by dropping and recreating functions
-- This addresses the security warnings from the linter

-- Drop existing increment_episode_views function
DROP FUNCTION IF EXISTS public.increment_episode_views(uuid);

-- Recreate increment_episode_views function with proper security settings
CREATE OR REPLACE FUNCTION public.increment_episode_views(episode_id_param UUID)
RETURNS void AS $$
DECLARE
    series_id_var UUID;
BEGIN
    -- Increment episode views
    UPDATE public.episodes 
    SET views = views + 1 
    WHERE id = episode_id_param;
    
    -- Get the series_id for this episode
    SELECT series_id INTO series_id_var 
    FROM public.episodes 
    WHERE id = episode_id_param;
    
    -- Increment series total views
    IF series_id_var IS NOT NULL THEN
        UPDATE public.series 
        SET total_views = total_views + 1 
        WHERE id = series_id_var;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;