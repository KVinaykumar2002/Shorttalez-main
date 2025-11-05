-- Insert demo profiles
INSERT INTO public.profiles (id, username, display_name, avatar_url, bio) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'priya_stories', 'Priya Sharma', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face', 'Storyteller from Mumbai. Love creating short stories about everyday life.'),
('550e8400-e29b-41d4-a716-446655440002', 'raj_creator', 'Rajesh Kumar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Comedy creator from Delhi. Making people laugh one story at a time.'),
('550e8400-e29b-41d4-a716-446655440003', 'sneha_tales', 'Sneha Patel', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Romance and drama specialist from Bangalore.'),
('550e8400-e29b-41d4-a716-446655440004', 'amit_action', 'Amit Singh', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Action and thriller content creator from Chennai.'),
('550e8400-e29b-41d4-a716-446655440005', 'kavya_dreams', 'Kavya Reddy', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'Fantasy and adventure stories from Hyderabad.');

-- Insert demo creators
INSERT INTO public.creators (id, user_id, bio, verified, follower_count) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Creating authentic Indian stories', true, 125000),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Comedy content that makes you smile', true, 89000),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Romance stories with heart', false, 67000),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'High-octane action sequences', true, 95000),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Magical stories and adventures', false, 43000);

-- Insert demo series
INSERT INTO public.series (id, creator_id, title, description, genre, language, status, thumbnail_url, episode_count, total_views) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Mumbai Diaries', 'Life in the bustling city of Mumbai', 'Drama', 'hi', 'published', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=400&fit=crop', 8, 450000),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Comedy Central', 'Hilarious situations from everyday life', 'Comedy', 'hi', 'published', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop', 12, 780000),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Love Actually', 'Modern love stories from India', 'Romance', 'hi', 'published', 'https://images.unsplash.com/photo-1518568814300-6c0582ba4351?w=300&h=400&fit=crop', 6, 320000),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'Action Heroes', 'Thrilling action sequences', 'Action', 'hi', 'published', 'https://images.unsplash.com/photo-1489599735734-79b4706ca9aa?w=300&h=400&fit=crop', 10, 890000),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'Magical Realms', 'Fantasy adventures in mystical worlds', 'Fantasy', 'hi', 'published', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop', 7, 230000),
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', 'Street Food Stories', 'Tales from Indian street food vendors', 'Drama', 'hi', 'published', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=400&fit=crop', 5, 180000),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 'Office Comedy', 'Workplace humor and situations', 'Comedy', 'en', 'published', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=400&fit=crop', 9, 560000),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440003', 'College Romance', 'Young love in Indian colleges', 'Romance', 'hi', 'published', 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=300&h=400&fit=crop', 11, 670000);

-- Insert demo episodes
INSERT INTO public.episodes (id, series_id, title, description, episode_number, video_url, thumbnail_url, duration, views, likes, comments_count, status) VALUES
-- Mumbai Diaries episodes
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Train Journey', 'A chance encounter on Mumbai local', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=400&fit=crop', 45, 67000, 2300, 145, 'approved'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Traffic Signal', 'Stories from a busy intersection', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&h=400&fit=crop', 52, 54000, 1890, 98, 'approved'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'Dabbawala', 'The lunch delivery system', 3, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=400&fit=crop', 48, 72000, 2890, 203, 'approved'),

-- Comedy Central episodes  
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Office Pranks', 'Hilarious office situations', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=400&fit=crop', 38, 89000, 4500, 567, 'approved'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', 'Family Dinner', 'Comedy during family gatherings', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1490650034439-fd184c3c86a5?w=300&h=400&fit=crop', 42, 95000, 5200, 678, 'approved'),

-- Love Actually episodes
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440003', 'First Date', 'Nervous first date in a cafe', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop', 35, 78000, 3400, 234, 'approved'),
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', 'Long Distance', 'Managing a long distance relationship', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=400&fit=crop', 41, 65000, 2890, 189, 'approved'),

-- Action Heroes episodes
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440004', 'Chase Scene', 'High-speed chase through the city', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=400&fit=crop', 55, 120000, 6700, 890, 'approved'),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440004', 'Fight Club', 'Underground fighting tournament', 2, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop', 47, 98000, 5400, 678, 'approved'),

-- Magical Realms episodes
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440005', 'Portal Discovery', 'Finding a magical portal', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop', 43, 45000, 2100, 156, 'approved'),

-- Street Food Stories episodes
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440006', 'Pani Puri Wala', 'Story of a pani puri vendor', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=400&fit=crop', 39, 56000, 2800, 234, 'approved'),

-- Office Comedy episodes
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440007', 'Meeting Chaos', 'When meetings go wrong', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=400&fit=crop', 36, 67000, 3200, 445, 'approved'),

-- College Romance episodes
('850e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440008', 'Library Love', 'Romance in the college library', 1, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=300&h=400&fit=crop', 44, 78000, 4100, 567, 'approved');