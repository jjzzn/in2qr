-- Create request_logs table for DDoS protection and rate limiting
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_request_logs_ip ON request_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_request_logs_endpoint ON request_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_request_logs_ip_timestamp ON request_logs(ip_address, timestamp);

-- Add comments
COMMENT ON TABLE request_logs IS 'Logs all API requests for rate limiting and DDoS protection';
COMMENT ON COLUMN request_logs.ip_address IS 'Client IP address or identifier';
COMMENT ON COLUMN request_logs.endpoint IS 'API endpoint that was accessed';
COMMENT ON COLUMN request_logs.method IS 'HTTP method (GET, POST, etc.)';
COMMENT ON COLUMN request_logs.user_agent IS 'Client user agent string';
COMMENT ON COLUMN request_logs.timestamp IS 'When the request was made';

-- Enable Row Level Security
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to read request logs" ON request_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert request logs" ON request_logs;
DROP POLICY IF EXISTS "Allow service role full access to request logs" ON request_logs;

-- Allow all users to read request logs (for rate limit checking)
CREATE POLICY "Allow all users to read request logs"
  ON request_logs
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert request logs
CREATE POLICY "Allow authenticated users to insert request logs"
  ON request_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to request logs"
  ON request_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to auto-cleanup old logs (keep only last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_request_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM request_logs 
  WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily
-- Note: This requires pg_cron extension which may not be available in all Supabase plans
-- You can manually run: SELECT cleanup_old_request_logs();
