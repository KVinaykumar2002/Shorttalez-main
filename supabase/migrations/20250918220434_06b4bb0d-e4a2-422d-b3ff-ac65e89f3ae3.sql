-- Update "New YouTube Series" to "Prostitute Premakatha" with new thumbnail
UPDATE public.series 
SET title = 'Prostitute Premakatha',
    description = 'Prostitute Premakatha series',
    thumbnail_url = '/src/assets/prostitute-premakatha-thumbnail.png'
WHERE title = 'New YouTube Series';