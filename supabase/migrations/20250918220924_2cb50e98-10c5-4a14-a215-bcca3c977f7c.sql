-- Create new series "Auto Johny S2"
WITH selected_creator AS (
  SELECT id FROM public.creators ORDER BY created_at LIMIT 1
)
INSERT INTO public.series (id, creator_id, title, description, status, genre, language, episode_count, thumbnail_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_creator.id,
  'Auto Johny S2',
  'Auto Johny Season 2 series',
  'published',
  'Action',
  'te',
  50,
  '/src/assets/auto-johny-s2-thumbnail.png',
  now(),
  now()
FROM selected_creator;

-- Insert episodes for Auto Johny S2 series
WITH selected_series AS (
  SELECT id FROM public.series WHERE title = 'Auto Johny S2'
)
INSERT INTO public.episodes (id, series_id, title, description, video_url, episode_number, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  selected_series.id,
  'Episode ' || episode_num,
  'Episode ' || episode_num || ' of Auto Johny S2',
  video_url,
  episode_num,
  'approved',
  now(),
  now()
FROM selected_series,
(VALUES 
  (1, 'https://www.youtube.com/embed/GEeTqHpBX-k?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (2, 'https://www.youtube.com/embed/mPHcCYTwtJg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (3, 'https://www.youtube.com/embed/4Bw3qFzIaJY?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (4, 'https://www.youtube.com/embed/VhZ6Jegi2d4?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (5, 'https://www.youtube.com/embed/JFv9wuJCk-s?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (6, 'https://www.youtube.com/embed/oVC-YzPLKr4?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (7, 'https://www.youtube.com/embed/-43ulSxzFDA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (8, 'https://www.youtube.com/embed/_clU6w55E1A?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (9, 'https://www.youtube.com/embed/ppBz5c42qUg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (10, 'https://www.youtube.com/embed/NKCP_zHx7Ks?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (11, 'https://www.youtube.com/embed/t2SYyN-CooU?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (12, 'https://www.youtube.com/embed/gnF5qdjJduU?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (13, 'https://www.youtube.com/embed/lZ5-mCjKn0Q?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (14, 'https://www.youtube.com/embed/YIR8vPrJOHA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (15, 'https://www.youtube.com/embed/tWZG8YZofKM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (16, 'https://www.youtube.com/embed/Tjbz0Tq6ams?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (17, 'https://www.youtube.com/embed/PPWz8EQvY30?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (18, 'https://www.youtube.com/embed/2NaTP-19udE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (19, 'https://www.youtube.com/embed/PFPgr0sSTlw?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (20, 'https://www.youtube.com/embed/jSngtahsctk?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (21, 'https://www.youtube.com/embed/1wAXdVuuJ5k?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (22, 'https://www.youtube.com/embed/D3vupWvCFos?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (23, 'https://www.youtube.com/embed/QKb8E79fa98?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (24, 'https://www.youtube.com/embed/EBTJNuCSCPI?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (25, 'https://www.youtube.com/embed/40Mo8bnutUs?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (26, 'https://www.youtube.com/embed/ISzjwWX4iDU?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (27, 'https://www.youtube.com/embed/WeW9pZu7eug?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (28, 'https://www.youtube.com/embed/Swxnqg9RK2Q?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (29, 'https://www.youtube.com/embed/joSW_YVWlGY?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (30, 'https://www.youtube.com/embed/dhLvgmvdeJs?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (31, 'https://www.youtube.com/embed/ltTQ0hjydD0?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (32, 'https://www.youtube.com/embed/qp824egdaEs?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (33, 'https://www.youtube.com/embed/WKeB53WmosA?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (34, 'https://www.youtube.com/embed/YZQnRAsDZ_s?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (35, 'https://www.youtube.com/embed/zATnca_TfV4?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (36, 'https://www.youtube.com/embed/46GOzdfwfqg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (37, 'https://www.youtube.com/embed/h2do9BLFKgQ?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (38, 'https://www.youtube.com/embed/AUZNDpbbK0g?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (39, 'https://www.youtube.com/embed/g0uwRlXKPqw?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (40, 'https://www.youtube.com/embed/kooBqmCd7lU?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (41, 'https://www.youtube.com/embed/JjVlo0yaK7U?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (42, 'https://www.youtube.com/embed/8usjscWENOg?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (43, 'https://www.youtube.com/embed/6oNByzSNuMs?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (44, 'https://www.youtube.com/embed/GRnMpJ9fCbE?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (45, 'https://www.youtube.com/embed/vGiOLrc_pRc?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (46, 'https://www.youtube.com/embed/NLItYdHqCqM?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (47, 'https://www.youtube.com/embed/qm5qnPNvo_w?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (48, 'https://www.youtube.com/embed/n-qONGRspxw?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (49, 'https://www.youtube.com/embed/tTDhB6QgpDY?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'),
  (50, 'https://www.youtube.com/embed/gS06GR6W3eo?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1')
) AS episodes_data(episode_num, video_url);