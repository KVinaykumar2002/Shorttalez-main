-- Make shanwalkermail@gmail.com an admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('6dd215b9-7907-4a7c-b26c-477b7272555c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;