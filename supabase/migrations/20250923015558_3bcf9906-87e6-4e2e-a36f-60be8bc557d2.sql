-- Create storage bucket for thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('episode-thumbnails', 'episode-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for thumbnails
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES 
  ('episode-thumbnails-public-read', 'episode-thumbnails', 'Public can view episode thumbnails', 'true', NULL, 'SELECT'),
  ('authenticated-can-upload-thumbnails', 'episode-thumbnails', 'Authenticated users can upload thumbnails', 'auth.uid() IS NOT NULL', 'auth.uid() IS NOT NULL', 'INSERT'),
  ('authenticated-can-update-thumbnails', 'episode-thumbnails', 'Authenticated users can update thumbnails', 'auth.uid() IS NOT NULL', 'auth.uid() IS NOT NULL', 'UPDATE')
ON CONFLICT (id) DO NOTHING;