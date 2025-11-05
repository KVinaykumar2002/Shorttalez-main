-- Update the "I'm not a virgin" series with the new thumbnail
UPDATE public.series 
SET thumbnail_url = '/thumbnails/im-not-virgin-thumbnail.jpg'
WHERE title = 'I''m not a virgin';