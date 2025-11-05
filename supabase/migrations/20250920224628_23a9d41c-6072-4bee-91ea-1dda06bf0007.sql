-- Enable real-time for posts table
ALTER TABLE posts REPLICA IDENTITY FULL;

-- Add posts table to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE posts;