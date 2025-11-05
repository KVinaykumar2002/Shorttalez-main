-- Delete the "I'm Not A Virgin" series (keeping "I'm Not A Virgin Mini Series")
-- This will cascade delete all episodes associated with this series

DELETE FROM public.series 
WHERE title = 'I''m Not A Virgin' 
AND id = '841851d2-9b1c-41f0-9773-2946243dbf7d';