-- Update the profile for shanwalkermail@gmail.com to be "Tall Talez Productions" with a unique username
UPDATE profiles 
SET 
  display_name = 'Tall Talez Productions',
  username = 'tall_talez_official',
  bio = 'Official creator of compelling drama series exploring complex human relationships and social dynamics.',
  updated_at = now()
WHERE id = '6dd215b9-7907-4a7c-b26c-477b7272555c';

-- Create a creator profile for the shanwalkermail@gmail.com user
INSERT INTO creators (user_id, bio, verified, created_at, updated_at)
VALUES (
  '6dd215b9-7907-4a7c-b26c-477b7272555c',
  'Official creator of compelling drama series exploring complex human relationships and social dynamics.',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  verified = EXCLUDED.verified,
  updated_at = now();