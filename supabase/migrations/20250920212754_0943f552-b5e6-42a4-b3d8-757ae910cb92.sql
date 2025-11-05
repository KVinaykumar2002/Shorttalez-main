-- Delete the "Short Series" 
-- This will cascade delete all episodes associated with this series

DELETE FROM public.series 
WHERE title = 'Short Series' 
AND id = 'e5acfe9e-e865-4a6b-a57f-543e099d0756';