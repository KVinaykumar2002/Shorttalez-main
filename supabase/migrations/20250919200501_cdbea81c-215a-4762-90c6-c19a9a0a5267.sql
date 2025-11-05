-- Create a function to safely increment episode views
CREATE OR REPLACE FUNCTION increment_episode_views(episode_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the view count for the episode
  UPDATE episodes 
  SET views = views + 1,
      updated_at = NOW()
  WHERE id = episode_id;
  
  -- Also update the total views for the series
  UPDATE series 
  SET total_views = total_views + 1,
      updated_at = NOW()
  WHERE id = (
    SELECT series_id 
    FROM episodes 
    WHERE id = episode_id
  );
END;
$$;