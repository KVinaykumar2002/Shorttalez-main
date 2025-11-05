-- Create demo data that works with current structure
-- First let's create some series with placeholder creator_ids that we'll handle in queries

-- Temporarily disable constraints to add demo data
SET session_replication_role = replica;

-- Insert demo series
INSERT INTO public.series (id, creator_id, title, description, genre, language, status, thumbnail_url, episode_count, total_views) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mumbai Diaries', 'Life in the bustling city of Mumbai', 'Drama', 'hi', 'published', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=400&fit=crop', 3, 450000),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Comedy Central', 'Hilarious situations from everyday life', 'Comedy', 'hi', 'published', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop', 2, 780000),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Love Actually', 'Modern love stories from India', 'Romance', 'hi', 'published', 'https://images.unsplash.com/photo-1518568814300-6c0582ba4351?w=300&h=400&fit=crop', 2, 320000),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Action Heroes', 'Thrilling action sequences', 'Action', 'hi', 'published', 'https://images.unsplash.com/photo-1489599735734-79b4706ca9aa?w=300&h=400&fit=crop', 2, 890000),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Tech Tales', 'Stories from the IT world', 'Drama', 'en', 'published', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop', 3, 230000)
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
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 'Long Distance', 'Managing a long distance relationship in India', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop', 41, 65000, 2890, 189, 'approved'),

-- Action Heroes episodes
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440004', 'Chase Scene', 'High-speed chase through the city', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=400&fit=crop', 55, 120000, 6700, 890, 'approved'),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440004', 'Fight Club', 'Underground fighting tournament', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', 47, 98000, 5400, 678, 'approved'),

-- Tech Tales episodes
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440005', 'Startup Life', 'Life in a tech startup', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=400&fit=crop', 43, 45000, 2100, 156, 'approved'),
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440005', 'Code Review', 'The dreaded code review process', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=400&fit=crop', 39, 56000, 2800, 234, 'approved'),
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440005', 'Bug Hunt', 'Finding and fixing mysterious bugs', 3, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=400&fit=crop', 47, 62000, 3100, 187, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Re-enable constraints
SET session_replication_role = DEFAULT;