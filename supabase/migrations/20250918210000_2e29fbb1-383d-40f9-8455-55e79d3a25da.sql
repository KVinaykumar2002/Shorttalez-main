-- Update series thumbnail to use the downloaded YouTube image
UPDATE series 
SET thumbnail_url = '/src/assets/im-not-virgin-thumbnail.jpg',
    updated_at = now()
WHERE id = '841851d2-9b1c-41f0-9773-2946243dbf7d';