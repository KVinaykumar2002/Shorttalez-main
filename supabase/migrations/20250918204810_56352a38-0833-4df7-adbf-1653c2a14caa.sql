-- Hide episodes 3-20 by marking them as draft and update episode count
UPDATE episodes
SET status = 'draft', updated_at = now()
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d'
  AND episode_number BETWEEN 3 AND 20;

UPDATE series
SET episode_count = 2, updated_at = now()
WHERE id = '841851d2-9b1c-41f0-9773-2946243dbf7d';