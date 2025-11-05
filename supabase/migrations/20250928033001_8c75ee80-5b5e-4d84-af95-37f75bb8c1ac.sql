-- Add premium field to series table
ALTER TABLE public.series 
ADD COLUMN is_premium boolean DEFAULT false;

-- Update specific series to be premium
UPDATE public.series 
SET is_premium = true 
WHERE title ILIKE '%miss unlucky%' OR title ILIKE '%not virgin%';

-- Add premium field to episodes table for future use
ALTER TABLE public.episodes 
ADD COLUMN is_premium boolean DEFAULT false;

-- Update episodes of premium series to be premium (except first episode of each series)
UPDATE public.episodes 
SET is_premium = true 
WHERE series_id IN (
  SELECT id FROM public.series WHERE is_premium = true
) AND episode_number > 1;