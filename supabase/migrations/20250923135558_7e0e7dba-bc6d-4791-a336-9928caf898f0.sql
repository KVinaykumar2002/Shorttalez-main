INSERT INTO public.user_roles (user_id, role) 
VALUES ('b59f752c-4ab0-4fed-8539-996d9e3cbdc5', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;