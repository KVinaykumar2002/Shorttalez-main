-- Create a new series
INSERT INTO public.series (
  id,
  title,
  description,
  creator_id,
  genre,
  language,
  status,
  episode_count,
  thumbnail_url
) VALUES (
  gen_random_uuid(),
  'New YouTube Series',
  'A collection of YouTube videos in a series format',
  (SELECT id FROM public.creators LIMIT 1),
  'Entertainment',
  'en',
  'published',
  23,
  NULL
);

-- Get the series ID for the episodes
WITH new_series AS (
  SELECT id FROM public.series WHERE title = 'New YouTube Series'
),
video_data AS (
  VALUES 
    ('VWsUi1cmZws', 1, 'Episode 1'),
    ('la0yDYHRFr8', 2, 'Episode 2'),
    ('rXJlMn251Yc', 3, 'Episode 3'),
    ('BxgFSjBVTY0', 4, 'Episode 4'),
    ('ipTqmVXEbaM', 5, 'Episode 5'),
    ('y1SSI7JJydo', 6, 'Episode 6'),
    ('lbydN6Fn_-0', 7, 'Episode 7'),
    ('SLTziWx8mA4', 8, 'Episode 8'),
    ('6FH2uW6gkLc', 9, 'Episode 9'),
    ('DdfCoDv7_9k', 10, 'Episode 10'),
    ('O-kpKCwc8j0', 11, 'Episode 11'),
    ('yhb9lzuOjIU', 12, 'Episode 12'),
    ('frA4SdP8G8M', 13, 'Episode 13'),
    ('UKGg21ja6ZM', 14, 'Episode 14'),
    ('kcFtFKpgi2Q', 15, 'Episode 15'),
    ('s6dCRoWvTTk', 16, 'Episode 16'),
    ('y32dsYCKBCc', 17, 'Episode 17'),
    ('nHs8P--a9-8', 18, 'Episode 18'),
    ('IIjbloJrVEw', 19, 'Episode 19'),
    ('MBJcUt2nS-I', 20, 'Episode 20'),
    ('-p12G7fSyVw', 21, 'Episode 21'),
    ('_ZBmpDHxKY4', 22, 'Episode 22'),
    ('JSqPLPczKgo', 23, 'Episode 23')
)
INSERT INTO public.episodes (
  id,
  series_id,
  title,
  description,
  episode_number,
  video_url,
  status,
  views,
  likes,
  comments_count,
  duration
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM new_series),
  vd.column3,
  'Episode description will be updated later',
  vd.column2,
  'https://www.youtube.com/embed/' || vd.column1,
  'approved',
  0,
  0,
  0,
  300
FROM video_data vd;