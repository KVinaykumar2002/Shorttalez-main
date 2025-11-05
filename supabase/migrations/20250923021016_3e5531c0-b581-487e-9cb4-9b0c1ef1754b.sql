-- Create the Trio Short Series
INSERT INTO series (
  title,
  description,
  creator_id,
  genre,
  status,
  episode_count,
  source_platform,
  created_at,
  updated_at
) VALUES (
  'Trio Short Series',
  'A compelling short series featuring three interconnected stories',
  (SELECT creator_id FROM series WHERE title = 'Auto Johny S1' LIMIT 1),
  'Drama',
  'published',
  8,
  'Vimeo',
  now(),
  now()
);

-- Insert episodes for Trio Short Series
INSERT INTO episodes (
  series_id,
  title,
  episode_number,
  video_url,
  status,
  created_at,
  updated_at
) 
SELECT 
  s.id as series_id,
  'Episode ' || episode_data.episode_number as title,
  episode_data.episode_number,
  episode_data.video_url,
  'approved' as status,
  now() as created_at,
  now() as updated_at
FROM series s,
(VALUES 
  (1, 'https://vimeo.com/1121028884'),
  (2, 'https://vimeo.com/1121028906'),
  (3, 'https://vimeo.com/1121028925'),
  (4, 'https://vimeo.com/1121028940'),
  (5, 'https://vimeo.com/1121028956'),
  (6, 'https://vimeo.com/1121028983'),
  (7, 'https://vimeo.com/1121029003'),
  (8, 'https://vimeo.com/1121029013')
) AS episode_data(episode_number, video_url)
WHERE s.title = 'Trio Short Series';