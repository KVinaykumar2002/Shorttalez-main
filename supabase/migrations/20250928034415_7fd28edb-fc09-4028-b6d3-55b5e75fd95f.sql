-- Make "I'm Not A Virgin" series premium
UPDATE public.series 
SET is_premium = true, updated_at = now()
WHERE id = '862a6c45-afa9-466f-a14d-4b8b57981226';