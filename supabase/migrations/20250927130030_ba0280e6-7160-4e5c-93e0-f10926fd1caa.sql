-- Insert the three new series associated with Tall Talez Productions
INSERT INTO series (
  creator_id,
  title,
  description,
  genre,
  language,
  status,
  episode_count,
  created_at,
  updated_at
) VALUES 
(
  'aca358aa-4de8-4878-92cc-d0e96c23228f',
  'Miss Unlucky',
  'A captivating series about Miss Unlucky and her adventures through life''s unexpected twists and turns',
  'Drama',
  'te',
  'published',
  9,
  NOW(),
  NOW()
),
(
  'aca358aa-4de8-4878-92cc-d0e96c23228f',
  'Auto Johny S 2',
  'The exciting continuation of Auto Johny''s adventures in season 2, featuring more action and thrills',
  'Action',
  'te',
  'published',
  10,
  NOW(),
  NOW()
),
(
  'aca358aa-4de8-4878-92cc-d0e96c23228f',
  '24 Hours S1',
  'An intense thriller series following 24 hours of non-stop action and suspense',
  'Thriller',
  'te',
  'published',
  10,
  NOW(),
  NOW()
);