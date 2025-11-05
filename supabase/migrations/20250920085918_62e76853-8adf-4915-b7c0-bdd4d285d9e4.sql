-- Update existing series with correct source platform based on their video URLs
UPDATE public.series 
SET source_platform = CASE 
  WHEN EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE episodes.series_id = series.id 
    AND episodes.video_url LIKE '%vimeo.com%'
  ) THEN 'Vimeo'
  WHEN EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE episodes.series_id = series.id 
    AND episodes.video_url LIKE '%youtube.com%'
  ) THEN 'YouTube'
  WHEN EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE episodes.series_id = series.id 
    AND episodes.video_url LIKE '%youtu.be%'
  ) THEN 'YouTube'
  ELSE 'Other'
END;