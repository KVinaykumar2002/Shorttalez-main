-- Create new series "Software Sankranthi Kastalu"
INSERT INTO public.series (id, creator_id, title, description, status, genre, language, episode_count, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.creators LIMIT 1),
  'Software Sankranthi Kastalu',
  'Software Sankranthi Kastalu series',
  'published',
  'Comedy',
  'te',
  16,
  now(),
  now()
);

-- Insert episodes for Software Sankranthi Kastalu series
INSERT INTO public.episodes (id, series_id, title, description, video_url, episode_number, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 1', 'Episode 1 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/gsBWmG95UUM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 1, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 2', 'Episode 2 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/26Svd7075zI?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 2, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 3', 'Episode 3 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/iRLiGPoL5Mc?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 3, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 4', 'Episode 4 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/N0z_UG0DTfE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 4, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 5', 'Episode 5 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/KDYeu8wVY50?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 5, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 6', 'Episode 6 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/ulE-XzrFHww?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 6, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 7', 'Episode 7 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/32fc4NtkInM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 7, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 8', 'Episode 8 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/kxdH5_NE2Jg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 8, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 9', 'Episode 9 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/R_UCu3XkaG8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 9, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 10', 'Episode 10 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/Mxk5CYIeJV8?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 10, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 11', 'Episode 11 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/rqXE5rd__4I?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 11, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 12', 'Episode 12 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/R0KmqPBx9kE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 12, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 13', 'Episode 13 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/QichxL0OHpM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 13, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 14', 'Episode 14 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/ltT6DK6xjuc?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 14, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 15', 'Episode 15 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/HL1zcQA0XP0?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 15, 'approved', now(), now()),
  (gen_random_uuid(), (SELECT id FROM public.series WHERE title = 'Software Sankranthi Kastalu'), 'Episode 16', 'Episode 16 of Software Sankranthi Kastalu', 'https://www.youtube.com/embed/pc77fOEkGDA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1', 16, 'approved', now(), now());