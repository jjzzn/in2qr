-- Add display_id column for human-readable QR code IDs
-- Create sequence for auto-incrementing display IDs
CREATE SEQUENCE IF NOT EXISTS qr_codes_display_id_seq START WITH 1;

-- Add display_id column
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Create function to generate display_id
CREATE OR REPLACE FUNCTION generate_qr_display_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  display_id TEXT;
BEGIN
  -- Get next sequence value
  next_id := nextval('qr_codes_display_id_seq');
  
  -- Format as QR-YYYY-NNN (e.g., QR-2026-001)
  display_id := 'QR-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_id::TEXT, 3, '0');
  
  RETURN display_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate display_id on insert
CREATE OR REPLACE FUNCTION set_qr_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := generate_qr_display_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_qr_display_id ON qr_codes;
CREATE TRIGGER trigger_set_qr_display_id
  BEFORE INSERT ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_qr_display_id();

-- Update existing rows with display_id
DO $$
DECLARE
  qr_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR qr_record IN 
    SELECT id FROM qr_codes WHERE display_id IS NULL ORDER BY created_at
  LOOP
    UPDATE qr_codes 
    SET display_id = 'QR-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(counter::TEXT, 3, '0')
    WHERE id = qr_record.id;
    counter := counter + 1;
  END LOOP;
  
  -- Update sequence to continue from last number
  PERFORM setval('qr_codes_display_id_seq', counter);
END $$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_qr_codes_display_id ON qr_codes(display_id);

-- Add comment
COMMENT ON COLUMN qr_codes.display_id IS 'Human-readable QR code ID (e.g., QR-2026-001)';
