-- Fix comments table to make episode_id optional for backward compatibility
ALTER TABLE public.comments ALTER COLUMN episode_id DROP NOT NULL;

-- Update existing comments without content_id to use episode_id
UPDATE public.comments 
SET content_id = episode_id, content_type = 'episode'
WHERE content_id IS NULL AND episode_id IS NOT NULL;

-- Add index for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_comments_content_type ON public.comments(content_type);

-- Update RLS policies to handle both old and new schemas
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) AND (
    -- New unified schema
    (content_type IN ('episode', 'post') AND content_id IS NOT NULL AND (
      (content_type = 'episode' AND EXISTS (
        SELECT 1 FROM episodes 
        WHERE episodes.id = comments.content_id AND episodes.status = 'approved'
      )) OR
      (content_type = 'post' AND EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.content_id
      ))
    )) OR
    -- Legacy schema compatibility
    (episode_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM episodes 
      WHERE episodes.id = comments.episode_id AND episodes.status = 'approved'
    ))
  )
);