-- Update episodes with working vertical demo videos
UPDATE public.episodes SET 
  video_url = CASE 
    WHEN id = '850e8400-e29b-41d4-a716-446655440001' THEN 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_1mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440002' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440003' THEN 'https://file-examples.com/storage/fe68c40f7fcada9ee51e8eb/2017/10/file_example_MP4_480_1_5MG.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440004' THEN 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_2mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440005' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440006' THEN 'https://file-examples.com/storage/fe68c40f7fcada9ee51e8eb/2017/10/file_example_MP4_640_3MG.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440007' THEN 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_1mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440008' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440009' THEN 'https://file-examples.com/storage/fe68c40f7fcada9ee51e8eb/2017/10/file_example_MP4_480_1_5MG.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440010' THEN 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_1280x720_2mb.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440011' THEN 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'
    WHEN id = '850e8400-e29b-41d4-a716-446655440012' THEN 'https://file-examples.com/storage/fe68c40f7fcada9ee51e8eb/2017/10/file_example_MP4_640_3MG.mp4'
    ELSE video_url
  END;