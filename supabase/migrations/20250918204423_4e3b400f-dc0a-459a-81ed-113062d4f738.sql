-- Update the first episode of the Toxic Boy friend series with the Google Drive video
UPDATE episodes 
SET video_url = 'https://drive.google.com/file/d/1Y3CLtrgiiyZCVlYYjqf6w9dyD6Bx9bdQ/view?usp=sharing',
    updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' 
AND episode_number = 1;