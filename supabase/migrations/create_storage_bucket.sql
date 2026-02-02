-- Create storage bucket for QR code assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'qr-assets',
  'qr-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for qr-assets bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for qr-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload qr-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their qr-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their qr-assets" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access for qr-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload qr-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'qr-assets' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their qr-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'qr-assets' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'qr-assets' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete their qr-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'qr-assets' 
  AND auth.role() = 'authenticated'
);
