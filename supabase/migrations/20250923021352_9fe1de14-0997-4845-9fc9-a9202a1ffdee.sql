-- Update existing episode titles to include series names
UPDATE episodes 
SET title = CASE 
  WHEN s.title = 'Trio Short Series' THEN 'Trio Episode ' || episodes.episode_number
  WHEN s.title = 'Auto Johny S1' THEN 'Auto Johny Episode ' || episodes.episode_number
  ELSE s.title || ' Episode ' || episodes.episode_number
END,
updated_at = now()
FROM series s 
WHERE episodes.series_id = s.id;