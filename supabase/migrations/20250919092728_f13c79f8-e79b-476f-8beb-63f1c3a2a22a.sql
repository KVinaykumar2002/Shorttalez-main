-- Create the "Short Series" under Tall Talez Productions
INSERT INTO public.series (
  title,
  description,
  creator_id,
  genre,
  language,
  status,
  created_at,
  updated_at
) VALUES (
  'Short Series',
  'A collection of short, engaging episodes that tell complete stories in bite-sized format.',
  '814ea987-28de-42ee-93a1-bab930b0b355',
  'Drama',
  'en',
  'published',
  now(),
  now()
);

-- Add the pCloud video as Episode 1
INSERT INTO public.episodes (
  title,
  description,
  series_id,
  episode_number,
  video_url,
  status,
  created_at,
  updated_at
) VALUES (
  'Episode 1',
  'The first episode of Short Series - a compelling introduction to our bite-sized storytelling format.',
  (SELECT id FROM public.series WHERE title = 'Short Series' AND creator_id = '814ea987-28de-42ee-93a1-bab930b0b355'),
  1,
  'https://u.pcloud.link/publink/show?code=XZ6ai15ZuL4DmqJn07XlWz4pYjtFjXCRAUj7',
  'approved',
  now(),
  now()
);

-- Update the series episode count
UPDATE public.series 
SET episode_count = 1, updated_at = now()
WHERE title = 'Short Series' AND creator_id = '814ea987-28de-42ee-93a1-bab930b0b355';