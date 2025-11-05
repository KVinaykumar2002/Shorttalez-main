-- Create the Auto Johny S1 series and episodes (fixed version)

-- Create the series first
INSERT INTO public.series (
  title,
  description,
  creator_id,
  genre,
  language,
  status,
  episode_count,
  total_views,
  created_at,
  updated_at
) VALUES (
  'Auto Johny S1',
  'Telugu mini series featuring Auto Johny - a story of love, relationships and life in the auto industry.',
  (SELECT id FROM public.creators WHERE user_id = '6dd215b9-7907-4a7c-b26c-477b7272555c' LIMIT 1),
  'Drama',
  'te',
  'published',
  10,
  0,
  now(),
  now()
);

-- Create episodes in proper order
INSERT INTO public.episodes (
  series_id,
  title,
  description,
  video_url,
  episode_number,
  status,
  views,
  likes,
  comments_count,
  created_at,
  updated_at
) VALUES
-- Episode 1
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'గా పోరి నాదిరా', 'Auto Johnny Episode 1', 'https://vimeo.com/1121026915', 1, 'approved', 0, 0, 0, now(), now()),

-- Episode 2 Part 1
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'Kiss Chesukundham', 'Auto Johnny Episode 2 Part 1', 'https://vimeo.com/1121026806', 2, 'approved', 0, 0, 0, now(), now()),

-- Episode 2 Part 2
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'అస్సలు ఆగలేకపోతున్నా', 'Auto Johnny Episode 2 Part 2', 'https://vimeo.com/1121026825', 3, 'approved', 0, 0, 0, now(), now()),

-- Episode 2 Part 3
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'నాకు లిప్ కిస్ కావాలి', 'Auto Johnny Episode 2 Part 3', 'https://vimeo.com/1121026936', 4, 'approved', 0, 0, 0, now(), now()),

-- Episode 2 Part 4
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'మీకు కూడా ఆ ఫీలింగ్స్ వస్తాయా', 'Auto Johnny Episode 2 Part 4', 'https://vimeo.com/1121026977', 5, 'approved', 0, 0, 0, now(), now()),

-- Final Episode Part 1
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'ఆల్రెడీ లవర్ ఉండగా ఇంకొకడితో', 'Auto Johnny Final Episode Part 1', 'https://vimeo.com/1121026846', 6, 'approved', 0, 0, 0, now(), now()),

-- Final Episode Part 2
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'ఇది మామూలు చీటింగ్ కాదు', 'Auto Johnny Final Episode Part 2', 'https://vimeo.com/1121026877', 7, 'approved', 0, 0, 0, now(), now()),

-- Final Episode Part 3
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'పెళ్లి అయిపోయింది', 'Auto Johnny Final Episode Part 3', 'https://vimeo.com/1121026955', 8, 'approved', 0, 0, 0, now(), now()),

-- Final Episode Part 4
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'వాడు అంటేనే పిచ్చి నాకు', 'Auto Johnny Final Episode Part 4', 'https://vimeo.com/1121026999', 9, 'approved', 0, 0, 0, now(), now()),

-- Full Movie/Breakup Episode
((SELECT id FROM public.series WHERE title = 'Auto Johny S1' LIMIT 1), 'Breakup - Auto Johnny Full Movie', 'Complete Auto Johnny story with Naveenraj, Bittu Dancer, and Pavan Tata', 'https://vimeo.com/1121026713', 10, 'approved', 0, 0, 0, now(), now());