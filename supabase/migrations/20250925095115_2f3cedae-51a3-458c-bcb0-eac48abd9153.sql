-- Consolidate all videos under main Tall Talez Productions account (shanwalkermail@gmail.com)
-- and remove duplicate channel (shanwalker1ai@gmail.com)

BEGIN;

-- Step 1: Move the series from duplicate creator to main creator
UPDATE series 
SET creator_id = 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid  -- Main creator ID
WHERE creator_id = '814ea987-28de-42ee-93a1-bab930b0b355'::uuid  -- Duplicate creator ID
  AND title = 'I''m Not A Virgin';

-- Step 2: Update the main creator's episode count and total views
-- Recalculate based on all series now owned by main creator
UPDATE creators 
SET 
  follower_count = (
    SELECT COUNT(DISTINCT s.follower_id) 
    FROM subscriptions s 
    WHERE s.creator_id IN ('aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid, '814ea987-28de-42ee-93a1-bab930b0b355'::uuid)
  ),
  updated_at = now()
WHERE id = 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid;

-- Step 3: Transfer unique subscriptions from duplicate creator to main creator
-- (avoiding duplicates)
INSERT INTO subscriptions (follower_id, creator_id, created_at)
SELECT DISTINCT s.follower_id, 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid, s.created_at
FROM subscriptions s
WHERE s.creator_id = '814ea987-28de-42ee-93a1-bab930b0b355'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions existing 
    WHERE existing.follower_id = s.follower_id 
    AND existing.creator_id = 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid
  );

-- Step 4: Remove subscriptions to the duplicate creator
DELETE FROM subscriptions 
WHERE creator_id = '814ea987-28de-42ee-93a1-bab930b0b355'::uuid;

-- Step 5: Remove the duplicate creator
DELETE FROM creators 
WHERE id = '814ea987-28de-42ee-93a1-bab930b0b355'::uuid;

-- Step 6: Remove the duplicate profile 
DELETE FROM profiles 
WHERE id = '140242e4-b30c-412d-8753-53532e00d601'::uuid;

-- Step 7: Update series episode counts for accuracy
UPDATE series s
SET episode_count = (
  SELECT COUNT(*) FROM episodes e WHERE e.series_id = s.id
)
WHERE s.creator_id = 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid;

-- Step 8: Update series total views for accuracy  
UPDATE series s
SET total_views = (
  SELECT COALESCE(SUM(e.views), 0) FROM episodes e WHERE e.series_id = s.id
)
WHERE s.creator_id = 'aca358aa-4de8-4878-92cc-d0e96c23228f'::uuid;

-- Step 9: Log this consolidation action
INSERT INTO debug_logs (level, message, source, additional_data, created_at)
VALUES (
  'info',
  'Consolidated all Tall Talez Productions videos under main account (shanwalkermail@gmail.com)',
  'admin_migration',
  jsonb_build_object(
    'main_creator_id', 'aca358aa-4de8-4878-92cc-d0e96c23228f',
    'removed_creator_id', '814ea987-28de-42ee-93a1-bab930b0b355',
    'series_moved', 1,
    'action', 'channel_consolidation'
  ),
  now()
);

COMMIT;