-- Clean up duplicate series and episodes
-- First, let's see what we have and clean up systematically

-- Remove duplicate episodes first (keep the earliest created ones)
WITH ranked_episodes AS (
  SELECT id, 
         series_id,
         episode_number,
         ROW_NUMBER() OVER (PARTITION BY series_id, episode_number ORDER BY created_at ASC) as rn
  FROM public.episodes
)
DELETE FROM public.episodes 
WHERE id IN (
  SELECT id FROM ranked_episodes WHERE rn > 1
);

-- Remove duplicate series (keep the earliest created ones)
WITH ranked_series AS (
  SELECT id, 
         title,
         creator_id,
         ROW_NUMBER() OVER (PARTITION BY title, creator_id ORDER BY created_at ASC) as rn
  FROM public.series
)
DELETE FROM public.series 
WHERE id IN (
  SELECT id FROM ranked_series WHERE rn > 1
);

-- Update episode counts to be accurate
UPDATE public.series 
SET episode_count = (
  SELECT COUNT(*) 
  FROM public.episodes 
  WHERE episodes.series_id = series.id 
    AND episodes.status = 'approved'
);