-- Update the pCloud video URL to use direct video streaming format
UPDATE public.episodes 
SET video_url = 'https://u.pcloud.link/publink/show?code=XZ6ai15ZuL4DmqJn07XlWz4pYjtFjXCRAUj7&download=1&type=auto',
    updated_at = now()
WHERE series_id = (SELECT id FROM public.series WHERE title = 'Short Series' AND creator_id = '814ea987-28de-42ee-93a1-bab930b0b355')
  AND episode_number = 1;