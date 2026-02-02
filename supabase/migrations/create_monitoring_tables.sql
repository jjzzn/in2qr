-- Create monitoring_metrics table
CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  endpoint TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  response_time DECIMAL(10, 3) NOT NULL,
  status_code INTEGER NOT NULL,
  error_message TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_ip ON monitoring_metrics(ip_address);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_status ON monitoring_metrics(status_code);

-- Create monitoring_alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create index for alerts
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_created ON monitoring_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_resolved ON monitoring_alerts(resolved);

-- Enable Row Level Security
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for monitoring_metrics (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read monitoring metrics"
  ON monitoring_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for monitoring_alerts (allow authenticated users to read)
CREATE POLICY "Allow authenticated users to read monitoring alerts"
  ON monitoring_alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert monitoring data
CREATE POLICY "Allow service role to insert monitoring metrics"
  ON monitoring_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert monitoring alerts"
  ON monitoring_alerts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create function to clean old monitoring data (older than 7 days)
CREATE OR REPLACE FUNCTION clean_old_monitoring_data()
RETURNS void AS $$
BEGIN
  DELETE FROM monitoring_metrics
  WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean old data (run daily)
-- Note: This requires pg_cron extension
-- SELECT cron.schedule('clean-monitoring-data', '0 0 * * *', 'SELECT clean_old_monitoring_data()');
