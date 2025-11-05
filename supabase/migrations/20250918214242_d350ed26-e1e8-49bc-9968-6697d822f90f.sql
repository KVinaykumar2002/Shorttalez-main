-- Update YouTube embed URLs to hide title, channel name, subscribe button, and other branding
UPDATE public.episodes 
SET video_url = REPLACE(video_url, 'https://www.youtube.com/embed/', 'https://www.youtube.com/embed/') || '?modestbranding=1&rel=0&showinfo=0&controls=1&autohide=1&iv_load_policy=3&cc_load_policy=0&disablekb=1'
WHERE video_url LIKE 'https://www.youtube.com/embed/%'
  AND video_url NOT LIKE '%?%';