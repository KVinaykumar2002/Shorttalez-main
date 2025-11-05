-- Update episodes with vertical demo videos for better reel experience
UPDATE public.episodes SET 
  video_url = CASE 
    WHEN id = '850e8400-e29b-41d4-a716-446655440001' THEN 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9a1c2e4&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440002' THEN 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9a1c2e4&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440003' THEN 'https://player.vimeo.com/external/434045411.sd.mp4?s=7c1c9b6b2e7f0b7c6f8e8b7c5f7b4c2a3b8e9c7d&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440004' THEN 'https://player.vimeo.com/external/434045411.sd.mp4?s=7c1c9b6b2e7f0b7c6f8e8b7c5f7b4c2a3b8e9c7d&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440005' THEN 'https://player.vimeo.com/external/438112296.sd.mp4?s=5d9e4c3a9b6b4c7f8a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440006' THEN 'https://player.vimeo.com/external/438112296.sd.mp4?s=5d9e4c3a9b6b4c7f8a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440007' THEN 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9a1c2e4&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440008' THEN 'https://player.vimeo.com/external/438112410.sd.mp4?s=8e7f2a3b4c8d9e6f7a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440009' THEN 'https://player.vimeo.com/external/438112410.sd.mp4?s=8e7f2a3b4c8d9e6f7a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440010' THEN 'https://player.vimeo.com/external/434045411.sd.mp4?s=7c1c9b6b2e7f0b7c6f8e8b7c5f7b4c2a3b8e9c7d&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440011' THEN 'https://player.vimeo.com/external/438112296.sd.mp4?s=5d9e4c3a9b6b4c7f8a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    WHEN id = '850e8400-e29b-41d4-a716-446655440012' THEN 'https://player.vimeo.com/external/438112410.sd.mp4?s=8e7f2a3b4c8d9e6f7a2b5c9d8e7f2a3b4c8d9e6f&profile_id=165&oauth2_token_id=57447761'
    ELSE video_url
  END;

-- Also update thumbnail URLs to vertical format
UPDATE public.episodes SET 
  thumbnail_url = CASE 
    WHEN id = '850e8400-e29b-41d4-a716-446655440001' THEN 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440002' THEN 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440003' THEN 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440004' THEN 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440005' THEN 'https://images.unsplash.com/photo-1490650034439-fd184c3c86a5?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440006' THEN 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440007' THEN 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440008' THEN 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440009' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440010' THEN 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440011' THEN 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=533&fit=crop'
    WHEN id = '850e8400-e29b-41d4-a716-446655440012' THEN 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=533&fit=crop'
    ELSE thumbnail_url
  END;