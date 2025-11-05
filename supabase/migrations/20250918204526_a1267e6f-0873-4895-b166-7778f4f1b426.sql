-- Update episode 2 of the Toxic Boy friend series with the Google Drive video
UPDATE episodes 
SET video_url = 'https://drive.google.com/file/d/1E-w48H4iPg0xfwOTyAAVxXf3f-6DTwmf/view?usp=sharing',
    updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' 
AND episode_number = 2;