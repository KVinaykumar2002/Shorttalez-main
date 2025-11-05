-- Remove all YouTube URLs from episodes 3-20 of the Toxic Boy friend series
UPDATE episodes 
SET video_url = '',
    updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' 
AND episode_number >= 3 
AND episode_number <= 20;