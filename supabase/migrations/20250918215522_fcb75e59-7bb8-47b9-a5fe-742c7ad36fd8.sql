-- Create new series "Dil Patang"
WITH selected_creator AS (
  SELECT id FROM public.creators ORDER BY created_at LIMIT 1
)
INSERT INTO public.series (id, creator_id, title, description, status, genre, language, episode_count, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_creator.id,
  'Dil Patang',
  'Dil Patang series',
  'published',
  'Romance',
  'hi',
  6,
  now(),
  now()
FROM selected_creator;

-- Insert episodes for Dil Patang series
WITH selected_series AS (
  SELECT id FROM public.series WHERE title = 'Dil Patang'
)
INSERT INTO public.episodes (id, series_id, title, description, video_url, episode_number, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_series.id,
  'Episode ' || episode_num,
  'Episode ' || episode_num || ' of Dil Patang',
  video_url,
  episode_num,
  'approved',
  now(),
  now()
FROM selected_series,
(VALUES 
  (1, 'https://www.youtube.com/embed/qq9vpm9JyFE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (2, 'https://www.youtube.com/embed/I8FZxM0bYh0?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (3, 'https://www.youtube.com/embed/FxCWfPFyAtA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (4, 'https://www.youtube.com/embed/wPN7XYa-q6g?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (5, 'https://www.youtube.com/embed/H_hL7gruBvk?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (6, 'https://www.youtube.com/embed/J7zZnx6Ykww?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1')
) AS episodes_data(episode_num, video_url);