-- Create the Toxic Boy friend series and episodes
-- First, create a creator profile for system/admin content
INSERT INTO public.creators (id, user_id, bio, verified) 
VALUES (gen_random_uuid(), '140242e4-b30c-412d-8753-53532e00d601', 'Creator of featured content series', true)
ON CONFLICT (user_id) DO NOTHING;

-- Get the creator ID for the series
DO $$
DECLARE
    creator_uuid uuid;
    series_uuid uuid;
BEGIN
    -- Get creator ID
    SELECT id INTO creator_uuid FROM public.creators WHERE user_id = '140242e4-b30c-412d-8753-53532e00d601' LIMIT 1;
    
    -- Create the Toxic Boy friend series
    INSERT INTO public.series (id, creator_id, title, description, status, genre, language, vertical_thumbnail_url)
    VALUES (
        gen_random_uuid(),
        creator_uuid,
        'Toxic Boy friend',
        'A dramatic series exploring toxic relationships and their impact on people''s lives. Follow the story of complex characters navigating unhealthy relationship dynamics.',
        'published',
        'Drama',
        'en',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop&crop=face'
    ) RETURNING id INTO series_uuid;
    
    -- Add episodes from the playlist
    INSERT INTO public.episodes (series_id, title, description, video_url, episode_number, status, duration, thumbnail_url)
    VALUES 
    (
        series_uuid,
        'The Beginning - Toxic Patterns',
        'Introduction to toxic relationship behaviors and warning signs that often go unnoticed.',
        'https://www.youtube.com/watch?v=Thnr3n7geyY',
        1,
        'approved',
        480,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop&crop=face'
    ),
    (
        series_uuid,
        'Red Flags - Part 1',
        'Exploring the early warning signs of toxic behavior in relationships.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        2,
        'approved',
        360,
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=450&fit=crop&crop=face'
    ),
    (
        series_uuid,
        'Manipulation Tactics',
        'Understanding how emotional manipulation works in toxic relationships.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        3,
        'approved',
        420,
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=450&fit=crop&crop=face'
    ),
    (
        series_uuid,
        'Breaking Free',
        'Stories of people who successfully left toxic relationships and rebuilt their lives.',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        4,
        'approved',
        540,
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=450&fit=crop&crop=face'
    );
    
    -- Update series episode count
    UPDATE public.series 
    SET episode_count = 4, 
        total_views = 15420,
        updated_at = now()
    WHERE id = series_uuid;
END $$;