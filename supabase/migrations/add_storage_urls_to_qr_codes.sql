-- Add storage URL columns to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS qr_image_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_image_url ON qr_codes(qr_image_url);
CREATE INDEX IF NOT EXISTS idx_qr_codes_logo_url ON qr_codes(logo_url);

-- Add comments
COMMENT ON COLUMN qr_codes.qr_image_url IS 'Public URL of QR code image stored in Supabase Storage';
COMMENT ON COLUMN qr_codes.logo_url IS 'Public URL of logo image stored in Supabase Storage';
