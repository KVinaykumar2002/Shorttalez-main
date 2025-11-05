-- Fix issue where some creators may have duplicate series counts
-- Add index for better performance on creator/series lookups
CREATE INDEX IF NOT EXISTS idx_series_creator_status ON series(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_episodes_series_status ON episodes(series_id, status);

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_series_search ON series USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(genre, '')));

-- Add index for interactions performance
CREATE INDEX IF NOT EXISTS idx_interactions_user_target ON interactions(user_id, target_id, target_type, interaction_type);