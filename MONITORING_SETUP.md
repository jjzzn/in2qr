# Monitoring Dashboard Setup Guide

## Overview
This monitoring dashboard provides real-time metrics and alerts for your QR code service, including request tracking, error monitoring, and geographic distribution.

## Features

### Real-time Metrics
1. **Requests per Minute** - Line chart showing traffic over last 10 minutes
2. **Unique IPs per Minute** - Count of distinct IP addresses
3. **Top 10 Requesting IPs** - Most active IP addresses with alert indicators
4. **Error Rate (%)** - Percentage of failed requests
5. **Average Response Time** - Performance metric in seconds
6. **Geographic Distribution** - Pie chart showing country-based traffic
7. **Alert Indicators** - Red borders and icons when thresholds exceeded

### Alert Thresholds (Configurable)
- **Max Requests/Min**: 100 (default)
- **Max Same IP Requests/Min**: 20 (default)
- **Max Error Rate**: 5% (default)
- **Max Response Time**: 2 seconds (default)

## Database Setup

### 1. Create Monitoring Tables

Run the SQL migration in Supabase:

```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Run the migration file: supabase/migrations/create_monitoring_tables.sql
```

Or manually create tables:

```sql
-- monitoring_metrics table
CREATE TABLE monitoring_metrics (
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

-- monitoring_alerts table
CREATE TABLE monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

### 2. Enable Row Level Security

The migration includes RLS policies that:
- Allow authenticated users to read monitoring data
- Allow service role to insert monitoring data
- Automatically clean data older than 7 days

## Integration

### Logging Metrics

To log monitoring metrics from your API endpoints:

```typescript
import { logMonitoringMetric } from './services/monitoringService';

// In your API handler
const startTime = Date.now();

try {
  // Your API logic here
  const result = await handleRequest();
  
  const responseTime = (Date.now() - startTime) / 1000;
  
  await logMonitoringMetric(
    '/api/create-qr',        // endpoint
    clientIP,                 // IP address
    userAgent,                // User agent
    responseTime,             // Response time in seconds
    200,                      // Status code
    undefined,                // Error message (if any)
    'Thailand',               // Country (optional)
    'Bangkok'                 // City (optional)
  );
  
} catch (error) {
  const responseTime = (Date.now() - startTime) / 1000;
  
  await logMonitoringMetric(
    '/api/create-qr',
    clientIP,
    userAgent,
    responseTime,
    500,
    error.message,
    'Thailand',
    'Bangkok'
  );
}
```

### Geographic Data

To get geographic data from IP addresses, you can use services like:

1. **ipapi.co** (Free tier: 1000 requests/day)
```typescript
const response = await fetch(`https://ipapi.co/${ip}/json/`);
const data = await response.json();
const country = data.country_name;
const city = data.city;
```

2. **ip-api.com** (Free, no API key required)
```typescript
const response = await fetch(`http://ip-api.com/json/${ip}`);
const data = await response.json();
const country = data.country;
const city = data.city;
```

## Accessing the Dashboard

### From Dashboard
Add a monitoring link to your Dashboard component:

```typescript
// In Dashboard.tsx
<button onClick={() => onNavigateToMonitoring()}>
  <Activity className="w-5 h-5" />
  Monitoring
</button>
```

### Direct URL
Navigate to the monitoring view programmatically:

```typescript
setCurrentView('monitoring');
```

## Alert Notifications

### Email Alerts (Setup Required)

1. Install email service (e.g., SendGrid):
```bash
npm install @sendgrid/mail
```

2. Configure in `monitoringService.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendAlertNotification = async (alerts: string[]) => {
  const msg = {
    to: 'admin@yourdomain.com',
    from: 'alerts@yourdomain.com',
    subject: '🚨 Monitoring Alert',
    text: alerts.join('\n'),
    html: `<strong>Alerts:</strong><br>${alerts.join('<br>')}`,
  };
  
  await sgMail.send(msg);
};
```

### Slack Alerts (Setup Required)

1. Create Slack webhook URL
2. Configure in `monitoringService.ts`:
```typescript
export const sendAlertNotification = async (alerts: string[]) => {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 *Monitoring Alert*\n${alerts.join('\n')}`,
    }),
  });
};
```

## Auto-refresh

The dashboard auto-refreshes every 10 seconds by default. You can:
- Toggle auto-refresh ON/OFF
- Manually refresh with "Refresh Now" button
- Adjust refresh interval in `MonitoringDashboard.tsx`:

```typescript
const interval = setInterval(() => {
  loadMetrics();
}, 10000); // 10 seconds (change as needed)
```

## Performance Optimization

### Data Retention
- Metrics are automatically cleaned after 7 days
- Adjust retention period in SQL function:
```sql
WHERE timestamp < NOW() - INTERVAL '30 days'; -- Change to 30 days
```

### Query Optimization
- Indexes are created on `timestamp`, `ip_address`, and `status_code`
- Queries fetch last 60 minutes by default
- Adjust time window in `getRecentMetrics(minutes)` call

## Troubleshooting

### No Data Showing
1. Check if monitoring tables exist in Supabase
2. Verify RLS policies are enabled
3. Ensure user is authenticated
4. Check if metrics are being logged

### Slow Performance
1. Reduce time window (default: 60 minutes)
2. Add more indexes if needed
3. Enable database query caching
4. Consider aggregating old data

### Alerts Not Triggering
1. Verify threshold values are set correctly
2. Check if `sendAlertNotification` is configured
3. Review alert history in `monitoring_alerts` table

## Tech Stack

- **Frontend**: React + TypeScript
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Polling (10-second intervals)
- **Notifications**: Email/Slack (optional)

## Security Notes

1. **RLS Enabled**: Only authenticated users can view monitoring data
2. **Service Role**: Required for inserting metrics from API
3. **API Keys**: Store in environment variables
4. **Rate Limiting**: Consider rate limiting the monitoring endpoints

## Next Steps

1. ✅ Create database tables
2. ✅ Integrate metric logging in API endpoints
3. ✅ Configure geographic IP lookup
4. ✅ Set up alert notifications (email/Slack)
5. ✅ Add monitoring link to navigation
6. ✅ Test with sample data
7. ✅ Deploy to production

## Sample Data (For Testing)

Insert sample metrics for testing:

```sql
INSERT INTO monitoring_metrics (endpoint, ip_address, user_agent, response_time, status_code, country)
VALUES 
  ('/api/create-qr', '192.168.1.1', 'Mozilla/5.0', 0.5, 200, 'Thailand'),
  ('/api/create-qr', '192.168.1.2', 'Mozilla/5.0', 0.3, 200, 'USA'),
  ('/api/create-qr', '192.168.1.1', 'Mozilla/5.0', 1.2, 500, 'Thailand'),
  ('/api/scan', '192.168.1.3', 'Mozilla/5.0', 0.2, 200, 'Japan');
```

## Support

For issues or questions:
- Check Supabase logs
- Review browser console for errors
- Verify database connections
- Test with sample data first
