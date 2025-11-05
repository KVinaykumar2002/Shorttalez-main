-- Update all YouTube embed URLs to hide title, channel name, subscribe button, and all branding
UPDATE public.episodes 
SET video_url = REGEXP_REPLACE(
  video_url, 
  '(https://www\.youtube\.com/embed/[^?]+)(\?.*)?', 
  '\1?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&color=white&theme=dark'
) 
WHERE video_url LIKE 'https://www.youtube.com/embed/%';