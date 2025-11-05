-- Create new series "Itlu Seethaamahalakshmi"
INSERT INTO public.series (id, creator_id, title, description, status, genre, language, episode_count, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.creators LIMIT 1),
  'Itlu Seethaamahalakshmi',
  'Itlu Seethaamahalakshmi series',
  'published',
  'Drama',
  'te',
  6,
  now(),
  now()
);

-- Insert episodes for Itlu Seethaamahalakshmi series
INSERT INTO public.episodes (id, series_id, title, description, video_url, episode_number, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 1', 'Episode 1 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/3HOiOxV7Kxo?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 1, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 2', 'Episode 2 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/HvSYFkw7ImM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 2, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 3', 'Episode 3 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/iRuCiJLmYV8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 3, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 4', 'Episode 4 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/dc1zsPNkQhU?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 4, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 5', 'Episode 5 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/iVmIJQmFXKM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 5, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Itlu Seethaamahalakshmi'), 'Episode 6', 'Episode 6 of Itlu Seethaamahalakshmi', 'https://www.youtube.com/embed/k5U0FfQJ0R8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 6, 'approved', now(), now());