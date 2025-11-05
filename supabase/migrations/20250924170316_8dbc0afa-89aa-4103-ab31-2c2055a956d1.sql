-- Fix comment system database schema to support both episodes and posts
-- Make comments table generic to handle multiple content types

-- First, add new columns for generic content referencing
ALTER TABLE public.comments 
ADD COLUMN content_type VARCHAR(20) DEFAULT 'episode',
ADD COLUMN content_id UUID;

-- Copy existing episode_id values to the new generic content_id
UPDATE public.comments 
SET content_id = episode_id, content_type = 'episode';

-- Make content_id not null now that it's populated
ALTER TABLE public.comments 
ALTER COLUMN content_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX idx_comments_content ON public.comments(content_type, content_id);

-- Create updated trigger for comment content validation
CREATE OR REPLACE FUNCTION public.validate_comment_content_v2()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic content validation
  IF LENGTH(TRIM(NEW.content)) < 1 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;
  
  IF LENGTH(NEW.content) > 2000 THEN
    RAISE EXCEPTION 'Comment content exceeds maximum length';
  END IF;
  
  -- Validate content type
  IF NEW.content_type NOT IN ('episode', 'post') THEN
    RAISE EXCEPTION 'Invalid content type. Must be episode or post';
  END IF;
  
  -- Remove potential XSS patterns (basic)
  NEW.content := regexp_replace(NEW.content, '<[^>]*>', '', 'g');
  NEW.content := regexp_replace(NEW.content, 'javascript:', '', 'gi');
  NEW.content := regexp_replace(NEW.content, 'vbscript:', '', 'gi');
  NEW.content := regexp_replace(NEW.content, 'on\w+\s*=', '', 'gi');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply the new validation trigger
DROP TRIGGER IF EXISTS validate_comment_content_trigger ON public.comments;
CREATE TRIGGER validate_comment_content_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.validate_comment_content_v2();

-- Update comment count trigger for posts
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comment count
    IF NEW.content_type = 'episode' THEN
      UPDATE public.episodes 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'post' THEN
      UPDATE public.posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comment count
    IF OLD.content_type = 'episode' THEN
      UPDATE public.episodes 
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'post' THEN
      UPDATE public.posts 
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply comment count trigger
CREATE TRIGGER update_comment_counts_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

-- Update RLS policies for new schema
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;  
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;

-- Updated RLS policies
CREATE POLICY "Authenticated users can view comments" ON public.comments
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments" ON public.comments
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (
    (content_type = 'episode' AND EXISTS (
      SELECT 1 FROM public.episodes WHERE id = content_id AND status = 'approved'
    )) OR
    (content_type = 'post' AND EXISTS (
      SELECT 1 FROM public.posts WHERE id = content_id
    ))
  )
);

CREATE POLICY "Users can update own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
FOR DELETE USING (auth.uid() = user_id);