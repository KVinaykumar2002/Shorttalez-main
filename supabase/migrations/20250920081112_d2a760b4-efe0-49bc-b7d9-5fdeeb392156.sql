-- Create function to update episode likes count
CREATE OR REPLACE FUNCTION update_episode_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT (new like)
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'episode' AND NEW.interaction_type = 'like' THEN
            UPDATE episodes 
            SET likes = likes + 1 
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (unlike)
    IF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'episode' AND OLD.interaction_type = 'like' THEN
            UPDATE episodes 
            SET likes = GREATEST(0, likes - 1)
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic like count updates
DROP TRIGGER IF EXISTS update_episode_likes_trigger ON interactions;
CREATE TRIGGER update_episode_likes_trigger
    AFTER INSERT OR DELETE ON interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_episode_likes_count();

-- Update existing like counts to sync with interactions table
UPDATE episodes 
SET likes = (
    SELECT COUNT(*) 
    FROM interactions 
    WHERE target_id = episodes.id 
    AND target_type = 'episode' 
    AND interaction_type = 'like'
);