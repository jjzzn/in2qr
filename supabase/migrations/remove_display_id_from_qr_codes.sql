-- Remove display_id column and related objects from qr_codes table
-- This fixes the 409 Conflict error when saving QR codes

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_set_qr_display_id ON qr_codes;

-- Drop functions
DROP FUNCTION IF EXISTS set_qr_display_id();
DROP FUNCTION IF EXISTS generate_qr_display_id();

-- Drop sequence
DROP SEQUENCE IF EXISTS qr_codes_display_id_seq;

-- Drop the column (this will also drop the unique constraint)
ALTER TABLE qr_codes DROP COLUMN IF EXISTS display_id;
