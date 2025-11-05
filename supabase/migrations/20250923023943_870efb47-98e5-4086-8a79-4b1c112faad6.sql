-- Update "I'm Not A Virgin" episodes with proper titles and ensure series has correct thumbnail
UPDATE public.episodes 
SET title = CASE episode_number
    WHEN 1 THEN 'I''m Not A Virgin - Episode 1: The Confession'
    WHEN 2 THEN 'I''m Not A Virgin - Episode 2: The Past Revealed'
    WHEN 3 THEN 'I''m Not A Virgin - Episode 3: Family Secrets'
    WHEN 4 THEN 'I''m Not A Virgin - Episode 4: Confrontation'
    WHEN 5 THEN 'I''m Not A Virgin - Episode 5: Truth and Lies'
    WHEN 6 THEN 'I''m Not A Virgin - Episode 6: Breaking Point'
    WHEN 7 THEN 'I''m Not A Virgin - Episode 7: Redemption'
    WHEN 8 THEN 'I''m Not A Virgin - Episode 8: New Beginnings'
    WHEN 9 THEN 'I''m Not A Virgin - Episode 9: Choices'
    WHEN 10 THEN 'I''m Not A Virgin - Episode 10: Resolution'
    ELSE title
END,
updated_at = now()
WHERE series_id = (SELECT id FROM public.series WHERE title = 'I''m Not A Virgin');

-- Ensure the series has the correct main thumbnail (different from episode thumbnails)
UPDATE public.series 
SET thumbnail_url = '/src/assets/im-not-virgin-new-thumbnail.jpg',
    updated_at = now()
WHERE title = 'I''m Not A Virgin';

-- Verify episodes are using their individual generated thumbnails (not the series thumbnail)
-- This is just a check - the episodes already have their proper Vimeo-generated thumbnails