-- Create new series "Software Sankranthi Kastalu"
WITH selected_creator AS (
  SELECT id FROM public.creators ORDER BY created_at LIMIT 1
)
INSERT INTO public.series (id, creator_id, title, description, status, genre, language, episode_count, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_creator.id,
  'Software Sankranthi Kastalu',
  'Software Sankranthi Kastalu series',
  'published',
  'Comedy',
  'te',
  16,
  now(),
  now()
FROM selected_creator;

-- Insert episodes for Software Sankranthi Kastalu series
WITH selected_series AS (
  SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'
)
INSERT INTO public.episodes (id, series_id, title, description, video_url, episode_number, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_series.id,
  'Episode ' || episode_num,
  'Episode ' || episode_num || ' of Software Sankranthi Kastalu',
  video_url,
  episode_num,
  'approved',
  now(),
  now()
FROM selected_series,
(VALUES 
  (1, 'https://www.youtube.com/embed/gsBWmG95UUM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (2, 'https://www.youtube.com/embed/26Svd7075zI?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (3, 'https://www.youtube.com/embed/iRLiGPoL5Mc?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (4, 'https://www.youtube.com/embed/N0z_UG0DTfE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (5, 'https://www.youtube.com/embed/KDYeu8wVY50?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (6, 'https://www.youtube.com/embed/ulE-XzrFHww?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (7, 'https://www.youtube.com/embed/32fc4NtkInM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (8, 'https://www.youtube.com/embed/kxdH5_NE2Jg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (9, 'https://www.youtube.com/embed/R_UCu3XkaG8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (10, 'https://www.youtube.com/embed/Mxk5CYIeJV8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (11, 'https://www.youtube.com/embed/rqXE5rd__4I?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (12, 'https://www.youtube.com/embed/R0KmqPBx9kE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (13, 'https://www.youtube.com/embed/QichxL0OHpM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (14, 'https://www.youtube.com/embed/ltT6DK6xjuc?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (15, 'https://www.youtube.com/embed/HL1zcQA0XP0?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (16, 'https://www.youtube.com/embed/pc77fOEkGDA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1')
) AS episodes_data(episode_num, video_url);