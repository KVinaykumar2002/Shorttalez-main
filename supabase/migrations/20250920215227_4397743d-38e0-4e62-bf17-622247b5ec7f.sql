-- Update the profile for shanwalkermail@gmail.com to be "Tall Talez Productions"
UPDATE profiles 
SET 
  display_name = 'Tall Talez Productions',
  username = 'tall_talez_productions',
  bio = 'Creator of compelling drama series exploring complex human relationships and social dynamics.',
  updated_at = now()
WHERE id = '6dd215b9-7907-4a7c-b26c-477b7272555c';

-- Create a creator profile for the shanwalkermail@gmail.com user
INSERT INTO creators (user_id, bio, verified, created_at, updated_at)
VALUES (
  '6dd215b9-7907-4a7c-b26c-477b7272555c',
  'Creator of compelling drama series exploring complex human relationships and social dynamics.',
  true,
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  verified = EXCLUDED.verified,
  updated_at = now();

-- Get the new creator ID and update all series to belong to this creator
UPDATE series 
SET creator_id = (
  SELECT id FROM creators WHERE user_id = '6dd215b9-7907-4a7c-b26c-477b7272555c'
),
updated_at = now()
WHERE id IN (
  '44c9d94b-35b3-4054-9a22-4baa57e24a25', -- I'm Not A Virgin Mini Series
  '4d690fa6-e6be-4bd8-bca8-a31c1604ca0e', -- Auto Johny S2
  '3de1487a-b53d-4eb0-a780-a14a166c1546', -- Dil Patang
  'e72b9b98-93dd-45a5-b3f4-91d1626a9cae', -- Software Sankranthi Kastalu
  '82a55fd7-21d9-474d-a55a-6f7c35299503', -- Itlu Seethaamahalakshmi
  '77450fa4-b766-42f3-b443-b225bfb7bca1'  -- Prostitute Premakatha
);