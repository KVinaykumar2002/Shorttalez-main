-- Create some basic demo data without specific user profiles
-- This creates standalone creators and series without depending on auth.users

-- First, let's create some standalone creators (these won't have profiles initially)
INSERT INTO public.creators (id, user_id, bio, verified, follower_count) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Creating authentic Indian stories', true, 125000),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Comedy content that makes you smile', true, 89000),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Romance stories with heart', false, 67000)
ON CONFLICT (id) DO NOTHING;

-- Insert demo series
INSERT INTO public.series (id, creator_id, title, description, genre, language, status, thumbnail_url, episode_count, total_views) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Mumbai Diaries', 'Life in the bustling city of Mumbai', 'Drama', 'hi', 'published', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=400&fit=crop', 3, 450000),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Comedy Central', 'Hilarious situations from everyday life', 'Comedy', 'hi', 'published', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop', 2, 780000),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Love Actually', 'Modern love stories from India', 'Romance', 'hi', 'published', 'https://images.unsplash.com/photo-1518568814300-6c0582ba4351?w=300&h=400&fit=crop', 2, 320000)
ON CONFLICT (id) DO NOTHING;

-- Insert demo episodes
INSERT INTO public.episodes (id, series_id, title, description, episode_number, video_url, thumbnail_url, duration, views, likes, comments_count, status) VALUES
-- Mumbai Diaries episodes
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Train Journey', 'A chance encounter on Mumbai local train', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=400&fit=crop', 45, 67000, 2300, 145, 'approved'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Traffic Signal', 'Stories from a busy Mumbai intersection', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&h=400&fit=crop', 52, 54000, 1890, 98, 'approved'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'Dabbawala', 'The famous Mumbai lunch delivery system', 3, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=400&fit=crop', 48, 72000, 2890, 203, 'approved'),

-- Comedy Central episodes
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Office Pranks', 'Hilarious office situations and pranks', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=400&fit=crop', 38, 89000, 4500, 567, 'approved'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', 'Family Dinner', 'Comedy during typical Indian family gatherings', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1490650034439-fd184c3c86a5?w=300&h=400&fit=crop', 42, 95000, 5200, 678, 'approved'),

-- Love Actually episodes
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440003', 'First Date', 'Nervous first date in a Mumbai cafe', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop', 35, 78000, 3400, 234, 'approved'),
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 'Long Distance', 'Managing a long distance relationship in India', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop', 41, 65000, 2890, 189, 'approved')
ON CONFLICT (id) DO NOTHING;