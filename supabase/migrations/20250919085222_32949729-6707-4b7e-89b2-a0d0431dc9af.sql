-- Add Cloudflare Stream support to episodes table
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS cloudflare_video_id TEXT,
ADD COLUMN IF NOT EXISTS migrated_to_cloudflare BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups of non-migrated episodes
CREATE INDEX IF NOT EXISTS idx_episodes_migration_status ON episodes(migrated_to_cloudflare);

-- Create index for Cloudflare video ID lookups
CREATE INDEX IF NOT EXISTS idx_episodes_cloudflare_video_id ON episodes(cloudflare_video_id) WHERE cloudflare_video_id IS NOT NULL;