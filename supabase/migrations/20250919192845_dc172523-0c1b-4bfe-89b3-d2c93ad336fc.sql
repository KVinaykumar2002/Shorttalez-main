-- Create trigger function to update episode likes count
CREATE OR REPLACE FUNCTION public.update_episode_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.interaction_type = 'like' AND NEW.target_type = 'episode' THEN
    UPDATE public.episodes 
    SET likes = likes + 1 
    WHERE id = NEW.target_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'like' AND OLD.target_type = 'episode' THEN
    UPDATE public.episodes 
    SET likes = likes - 1 
    WHERE id = OLD.target_id AND likes > 0;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interactions table
CREATE TRIGGER update_episode_likes_trigger
  AFTER INSERT OR DELETE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_episode_likes_count();

-- Create posts table for Twitter-like functionality
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type VARCHAR(50),
  post_type VARCHAR(50) NOT NULL DEFAULT 'original', -- 'original', 'reshare'
  reshared_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reshared_episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reshares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Anyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update post interaction counts
CREATE OR REPLACE FUNCTION public.update_post_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.target_type = 'post' THEN
      CASE NEW.interaction_type
        WHEN 'like' THEN
          UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.target_id;
        WHEN 'reshare' THEN
          UPDATE public.posts SET reshares_count = reshares_count + 1 WHERE id = NEW.target_id;
      END CASE;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.target_type = 'post' THEN
      CASE OLD.interaction_type
        WHEN 'like' THEN
          UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.target_id;
        WHEN 'reshare' THEN
          UPDATE public.posts SET reshares_count = GREATEST(reshares_count - 1, 0) WHERE id = OLD.target_id;
      END CASE;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post interactions
CREATE TRIGGER update_post_interaction_counts_trigger
  AFTER INSERT OR DELETE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_interaction_counts();