-- Create the "I'm Not A Virgin" series and episodes
DO $$
DECLARE
    creator_uuid uuid;
    series_uuid uuid;
    episode_titles text[] := ARRAY[
        'Episode 1', 'Episode 2', 'Episode 3', 'Episode 4', 'Episode 5',
        'Episode 6', 'Episode 7', 'Episode 8', 'Episode 9', 'Episode 10'
    ];
    episode_urls text[] := ARRAY[
        'https://vimeo.com/1121033942',
        'https://vimeo.com/1121034021', 
        'https://vimeo.com/1121034063',
        'https://vimeo.com/1121034102',
        'https://vimeo.com/1121034119',
        'https://vimeo.com/1121034148',
        'https://vimeo.com/1121034196',
        'https://vimeo.com/1121034214',
        'https://vimeo.com/1121034238',
        'https://vimeo.com/1121034172'
    ];
    i integer;
BEGIN
    -- Get the first creator (assuming this is for an existing creator)
    SELECT id INTO creator_uuid FROM public.creators ORDER BY created_at ASC LIMIT 1;
    
    -- If no creator exists, create one using the first user
    IF creator_uuid IS NULL THEN
        INSERT INTO public.creators (user_id, bio)
        SELECT id, 'Content Creator'
        FROM auth.users 
        ORDER BY created_at ASC 
        LIMIT 1
        RETURNING id INTO creator_uuid;
    END IF;
    
    -- Create the series
    INSERT INTO public.series (
        creator_id,
        title,
        description,
        genre,
        language,
        status,
        episode_count,
        thumbnail_url
    ) VALUES (
        creator_uuid,
        'I''m Not A Virgin',
        'A provocative and bold series exploring modern relationships and personal experiences.',
        'Drama',
        'en',
        'published',
        10,
        '/src/assets/im-not-virgin-new-thumbnail.jpg'
    ) RETURNING id INTO series_uuid;
    
    -- Create all 10 episodes
    FOR i IN 1..10 LOOP
        INSERT INTO public.episodes (
            series_id,
            title,
            episode_number,
            video_url,
            status,
            thumbnail_url
        ) VALUES (
            series_uuid,
            episode_titles[i],
            i,
            episode_urls[i],
            'approved',
            '/src/assets/im-not-virgin-new-thumbnail.jpg'
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully created series "I''m Not A Virgin" with % episodes', array_length(episode_titles, 1);
END $$;