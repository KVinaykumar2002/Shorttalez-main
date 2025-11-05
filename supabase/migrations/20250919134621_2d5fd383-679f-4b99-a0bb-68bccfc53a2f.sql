-- Create the new Mini Series
INSERT INTO public.series (
  id,
  title,
  description,
  creator_id,
  genre,
  language,
  status,
  thumbnail_url,
  episode_count,
  total_views,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'I''m Not A Virgin Mini Series',
  'A condensed mini series version exploring toxic relationships and their impact. A dramatic exploration of complex characters navigating unhealthy relationship dynamics in a more focused format.',
  '814ea987-28de-42ee-93a1-bab930b0b355',
  'Drama',
  'en',
  'published',
  '/src/assets/im-not-virgin-new-thumbnail.jpg',
  0,
  0,
  now(),
  now()
);

-- Get the series ID for episodes (we'll use the generated ID)
WITH new_series AS (
  SELECT id as series_id FROM public.series WHERE title = 'I''m Not A Virgin Mini Series' LIMIT 1
)
-- Insert sample episodes with Vimeo URLs from the folder
INSERT INTO public.episodes (
  id,
  title,
  description,
  series_id,
  episode_number,
  video_url,
  thumbnail_url,
  duration,
  status,
  views,
  likes,
  comments_count,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Episode ' || episode_num,
  'Episode ' || episode_num || ' from the I''m Not A Virgin Mini Series',
  series_id,
  episode_num,
  'https://vimeo.com/user/247291936/folder/26664379', -- Will be updated with specific video URLs
  '/src/assets/im-not-virgin-new-thumbnail.jpg',
  300, -- 5 minutes default
  'approved',
  0,
  0,
  0,
  now(),
  now()
FROM new_series,
generate_series(1, 6) as episode_num; -- Creating 6 episodes initially

-- Update the series episode count
UPDATE public.series 
SET episode_count = 6, updated_at = now() 
WHERE title = 'I''m Not A Virgin Mini Series';