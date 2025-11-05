-- Add foreign key constraint and fix posts table relationships
ALTER TABLE posts 
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for reshared posts
ALTER TABLE posts 
ADD CONSTRAINT posts_reshared_post_id_fkey 
FOREIGN KEY (reshared_post_id) REFERENCES posts(id) ON DELETE SET NULL;

-- Add foreign key for reshared episodes  
ALTER TABLE posts 
ADD CONSTRAINT posts_reshared_episode_id_fkey 
FOREIGN KEY (reshared_episode_id) REFERENCES episodes(id) ON DELETE SET NULL;

-- Enable real-time for posts table
ALTER TABLE posts REPLICA IDENTITY FULL;

-- Add posts table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;