-- Delete the duplicate Trio series (keeping the first one)
-- First delete episodes from the duplicate series
DELETE FROM episodes WHERE series_id = '0d4c3d2a-948e-4271-97d3-c7a80f399138';

-- Then delete the duplicate series
DELETE FROM series WHERE id = '0d4c3d2a-948e-4271-97d3-c7a80f399138';