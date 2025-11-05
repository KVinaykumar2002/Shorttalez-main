-- Create storage buckets for video uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('videos', 'videos', false),
  ('thumbnails', 'thumbnails', true);

-- Create storage policies for videos
CREATE POLICY "Authenticated users can upload videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own videos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'videos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policies for thumbnails  
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.uid() IS NOT NULL  
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'thumbnails');