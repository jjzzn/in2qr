import { supabase } from '../lib/supabase';

export interface MonitoringMetric {
  id: string;
  timestamp: string;
  endpoint: string;
  ip_address: string;
  user_agent: string;
  response_time: number;
  status_code: number;
  error_message?: string;
  country?: string;
  city?: string;
}

export interface MetricsSummary {
  requestsPerMinute: number;
  uniqueIpsPerMinute: number;
  errorRate: number;
  avgResponseTime: number;
  topIPs: { ip: string; count: number }[];
  geographicDistribution: { country: string; count: number }[];
  recentRequests: MonitoringMetric[];
}

export interface AlertThresholds {
  maxRequestsPerMinute: number;
  maxSameIPRequestsPerMinute: number;
  maxErrorRate: number;
  maxResponseTime: number;
}

export const defaultThresholds: AlertThresholds = {
  maxRequestsPerMinute: 100,
  maxSameIPRequestsPerMinute: 20,
  maxErrorRate: 5,
  maxResponseTime: 2,
};

// Log monitoring metric
export const logMonitoringMetric = async (
  endpoint: string,
  ipAddress: string,
  userAgent: string,
  responseTime: number,
  statusCode: number,
  errorMessage?: string,
  country?: string,
  city?: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('monitoring_metrics')
      .insert({
        endpoint,
        ip_address: ipAddress,
        user_agent: userAgent,
        response_time: responseTime,
        status_code: statusCode,
        error_message: errorMessage,
        country,
        city,
      });

    return { error };
  } catch (error) {
    return { error };
  }
};

// Get metrics for the last N minutes
export const getRecentMetrics = async (
  minutes: number = 5
): Promise<{ data: MonitoringMetric[] | null; error: any }> => {
  try {
    const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('monitoring_metrics')
      .select('*')
      .gte('timestamp', startTime)
      .order('timestamp', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Calculate metrics summary
export const calculateMetricsSummary = (
  metrics: MonitoringMetric[]
): MetricsSummary => {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Filter metrics from last minute
  const lastMinuteMetrics = metrics.filter(
    (m) => new Date(m.timestamp).getTime() > oneMinuteAgo
  );

  // Requests per minute
  const requestsPerMinute = lastMinuteMetrics.length;

  // Unique IPs per minute
  const uniqueIPs = new Set(lastMinuteMetrics.map((m) => m.ip_address));
  const uniqueIpsPerMinute = uniqueIPs.size;

  // Error rate
  const errorCount = lastMinuteMetrics.filter((m) => m.status_code >= 400).length;
  const errorRate = lastMinuteMetrics.length > 0 
    ? (errorCount / lastMinuteMetrics.length) * 100 
    : 0;

  // Average response time
  const totalResponseTime = lastMinuteMetrics.reduce(
    (sum, m) => sum + m.response_time,
    0
  );
  const avgResponseTime = lastMinuteMetrics.length > 0
    ? totalResponseTime / lastMinuteMetrics.length
    : 0;

  // Top 10 requesting IPs (from all metrics, not just last minute)
  const ipCounts = metrics.reduce((acc, m) => {
    acc[m.ip_address] = (acc[m.ip_address] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Geographic distribution
  const countryCounts = metrics.reduce((acc, m) => {
    if (m.country) {
      acc[m.country] = (acc[m.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const geographicDistribution = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    requestsPerMinute,
    uniqueIpsPerMinute,
    errorRate,
    avgResponseTime,
    topIPs,
    geographicDistribution,
    recentRequests: metrics.slice(0, 50),
  };
};

// Check if any thresholds are exceeded
export const checkAlerts = (
  summary: MetricsSummary,
  thresholds: AlertThresholds
): {
  hasAlerts: boolean;
  alerts: string[];
} => {
  const alerts: string[] = [];

  if (summary.requestsPerMinute > thresholds.maxRequestsPerMinute) {
    alerts.push(
      `High request rate: ${summary.requestsPerMinute} requests/min (threshold: ${thresholds.maxRequestsPerMinute})`
    );
  }

  // Check if any single IP exceeds threshold
  const highTrafficIP = summary.topIPs.find(
    (ip) => ip.count > thresholds.maxSameIPRequestsPerMinute
  );
  if (highTrafficIP) {
    alerts.push(
      `High traffic from IP ${highTrafficIP.ip}: ${highTrafficIP.count} requests/min (threshold: ${thresholds.maxSameIPRequestsPerMinute})`
    );
  }

  if (summary.errorRate > thresholds.maxErrorRate) {
    alerts.push(
      `High error rate: ${summary.errorRate.toFixed(2)}% (threshold: ${thresholds.maxErrorRate}%)`
    );
  }

  if (summary.avgResponseTime > thresholds.maxResponseTime) {
    alerts.push(
      `Slow response time: ${summary.avgResponseTime.toFixed(2)}s (threshold: ${thresholds.maxResponseTime}s)`
    );
  }

  return {
    hasAlerts: alerts.length > 0,
    alerts,
  };
};

// Send alert notification (placeholder for email/Slack integration)
export const sendAlertNotification = async (
  alerts: string[]
): Promise<{ error: any }> => {
  try {
    // Log alert to database
    const { error } = await supabase
      .from('monitoring_alerts')
      .insert({
        alert_type: 'threshold_exceeded',
        message: alerts.join('\n'),
        severity: 'high',
      });

    // TODO: Integrate with email service (e.g., SendGrid) or Slack webhook
    // Example Slack webhook:
    // await fetch('YOUR_SLACK_WEBHOOK_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     text: `🚨 Monitoring Alert:\n${alerts.join('\n')}`,
    //   }),
    // });

    return { error };
  } catch (error) {
    return { error };
  }
};

// Get alert history
export const getAlertHistory = async (
  limit: number = 50
): Promise<{ data: any[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('monitoring_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};
