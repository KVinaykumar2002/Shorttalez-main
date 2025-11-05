-- Update with working vertical demo videos
UPDATE public.episodes SET 
  video_url = CASE 
    WHEN id = '850e8400-e29b-41d4-a716-446655440001' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_1mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440002' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_2mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440003' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_360x640_5mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440004' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440005' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440006' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440007' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440008' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440009' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440010' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440011' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440012' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    ELSE video_url
  END;