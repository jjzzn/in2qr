-- Create IP blacklist table
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_client ON ip_blacklist(client_id);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_expires ON ip_blacklist(expires_at);

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  violation_type TEXT,
  violation_count INTEGER,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for security events
CREATE INDEX IF NOT EXISTS idx_security_events_client ON security_events(client_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for ip_blacklist (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read ip blacklist"
  ON ip_blacklist
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for security_events (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read security events"
  ON security_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert/update/delete
CREATE POLICY "Allow service role to manage ip blacklist"
  ON ip_blacklist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage security events"
  ON security_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to clean expired blacklist entries
CREATE OR REPLACE FUNCTION clean_expired_blacklist()
RETURNS void AS $$
BEGIN
  DELETE FROM ip_blacklist
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old security events (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_security_events()
RETURNS void AS $$
BEGIN
  DELETE FROM security_events
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Note: To schedule automatic cleanup, use pg_cron extension:
-- SELECT cron.schedule('clean-blacklist', '0 * * * *', 'SELECT clean_expired_blacklist()');
-- SELECT cron.schedule('clean-security-events', '0 0 * * *', 'SELECT clean_old_security_events()');
