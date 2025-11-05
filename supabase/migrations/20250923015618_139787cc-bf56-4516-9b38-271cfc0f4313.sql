-- Create storage bucket for thumbnails if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('episode-thumbnails', 'episode-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the episode-thumbnails bucket
CREATE POLICY "Public can view episode thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'episode-thumbnails');

CREATE POLICY "Authenticated users can upload episode thumbnails" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'episode-thumbnails' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update episode thumbnails" ON storage.objects
FOR UPDATE USING (bucket_id = 'episode-thumbnails' AND auth.uid() IS NOT NULL);