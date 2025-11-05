-- Update the existing "Toxic Boy friend" series to have 20 episodes from the playlist
-- First, delete existing demo episodes (keeping only the first one with correct URL)
DELETE FROM episodes WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number > 1;

-- Update the first episode to have the correct URL from the playlist
UPDATE episodes 
SET video_url = 'https://www.youtube.com/watch?v=Thnr3n7geyY',
    title = 'Episode 1',
    description = 'First episode from the Toxic Boy Friend playlist'
WHERE series_id = '841851d2-9b1c-41f0-9773-2946243dbf7d' AND episode_number = 1;

-- Insert 19 more episodes as placeholders for the playlist videos
INSERT INTO episodes (series_id, episode_number, title, description, video_url, status, duration, thumbnail_url) VALUES
('841851d2-9b1c-41f0-9773-2946243dbf7d', 2, 'Episode 2', 'Second episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_2', 'approved', 300, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 3, 'Episode 3', 'Third episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_3', 'approved', 300, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 4, 'Episode 4', 'Fourth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_4', 'approved', 300, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 5, 'Episode 5', 'Fifth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_5', 'approved', 300, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 6, 'Episode 6', 'Sixth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_6', 'approved', 300, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 7, 'Episode 7', 'Seventh episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_7', 'approved', 300, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 8, 'Episode 8', 'Eighth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_8', 'approved', 300, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 9, 'Episode 9', 'Ninth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_9', 'approved', 300, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 10, 'Episode 10', 'Tenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_10', 'approved', 300, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 11, 'Episode 11', 'Eleventh episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_11', 'approved', 300, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 12, 'Episode 12', 'Twelfth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_12', 'approved', 300, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 13, 'Episode 13', 'Thirteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_13', 'approved', 300, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 14, 'Episode 14', 'Fourteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_14', 'approved', 300, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 15, 'Episode 15', 'Fifteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_15', 'approved', 300, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 16, 'Episode 16', 'Sixteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_16', 'approved', 300, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 17, 'Episode 17', 'Seventeenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_17', 'approved', 300, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 18, 'Episode 18', 'Eighteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_18', 'approved', 300, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 19, 'Episode 19', 'Nineteenth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_19', 'approved', 300, 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'),
('841851d2-9b1c-41f0-9773-2946243dbf7d', 20, 'Episode 20', 'Twentieth episode from the Toxic Boy Friend playlist', 'https://www.youtube.com/watch?v=PLACEHOLDER_20', 'approved', 300, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face');

-- Update the series episode count
UPDATE series 
SET episode_count = 20 
WHERE id = '841851d2-9b1c-41f0-9773-2946243dbf7d';