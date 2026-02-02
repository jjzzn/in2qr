import { useEffect, useState } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, AlertTriangle, Clock, Globe, TrendingUp, 
  Users, Server, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import { Header } from '../components/Header';
import {
  getRecentMetrics,
  calculateMetricsSummary,
  checkAlerts,
  sendAlertNotification,
  defaultThresholds,
  type MetricsSummary,
  type AlertThresholds,
  type MonitoringMetric,
} from '../services/monitoringService';

interface MonitoringDashboardProps {
  onBack: () => void;
}

export const MonitoringDashboard = ({ onBack }: MonitoringDashboardProps) => {
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [hasAlerts, setHasAlerts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState<AlertThresholds>(defaultThresholds);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load metrics
  const loadMetrics = async () => {
    const { data, error } = await getRecentMetrics(60); // Last 60 minutes
    
    if (!error && data) {
      setMetrics(data);
      const calculatedSummary = calculateMetricsSummary(data);
      setSummary(calculatedSummary);
      
      const alertCheck = checkAlerts(calculatedSummary, thresholds);
      setHasAlerts(alertCheck.hasAlerts);
      setAlerts(alertCheck.alerts);
      
      // Send notification if new alerts
      if (alertCheck.hasAlerts && alertCheck.alerts.length > 0) {
        await sendAlertNotification(alertCheck.alerts);
      }
      
      setLastUpdate(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadMetrics();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, thresholds]);

  // Prepare chart data for requests per minute (last 10 minutes)
  const getRequestsChartData = () => {
    if (!metrics.length) return [];
    
    const now = Date.now();
    const data: { time: string; requests: number }[] = [];
    
    for (let i = 9; i >= 0; i--) {
      const minuteStart = now - (i + 1) * 60 * 1000;
      const minuteEnd = now - i * 60 * 1000;
      
      const count = metrics.filter(m => {
        const timestamp = new Date(m.timestamp).getTime();
        return timestamp >= minuteStart && timestamp < minuteEnd;
      }).length;
      
      const label = new Date(minuteEnd).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      data.push({ time: label, requests: count });
    }
    
    return data;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onDashboardClick={onBack} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary-500" />
                System Monitoring
              </h1>
              <p className="text-gray-600 mt-1">Real-time performance metrics and alerts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? '● Auto-refresh ON' : '○ Auto-refresh OFF'}
              </button>
              <button
                onClick={loadMetrics}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Refresh Now
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          {hasAlerts && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-900 font-semibold mb-2">⚠️ Active Alerts</h3>
                  <ul className="space-y-1">
                    {alerts.map((alert, idx) => (
                      <li key={idx} className="text-red-800 text-sm">• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Requests per Minute */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${
            summary && summary.requestsPerMinute > thresholds.maxRequestsPerMinute 
              ? 'border-2 border-red-500' 
              : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              {summary && summary.requestsPerMinute > thresholds.maxRequestsPerMinute && (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm">Requests/Min</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary?.requestsPerMinute || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Threshold: {thresholds.maxRequestsPerMinute}
            </p>
          </div>

          {/* Unique IPs per Minute */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm">Unique IPs/Min</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary?.uniqueIpsPerMinute || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Active users
            </p>
          </div>

          {/* Error Rate */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${
            summary && summary.errorRate > thresholds.maxErrorRate 
              ? 'border-2 border-red-500' 
              : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
              {summary && summary.errorRate > thresholds.maxErrorRate && (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm">Error Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary?.errorRate.toFixed(2) || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Threshold: {thresholds.maxErrorRate}%
            </p>
          </div>

          {/* Average Response Time */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${
            summary && summary.avgResponseTime > thresholds.maxResponseTime 
              ? 'border-2 border-red-500' 
              : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
              {summary && summary.avgResponseTime > thresholds.maxResponseTime && (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm">Avg Response Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {summary?.avgResponseTime.toFixed(2) || 0}s
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Threshold: {thresholds.maxResponseTime}s
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Requests per Minute Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Requests per Minute (Last 10 min)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getRequestsChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Geographic Distribution
            </h3>
            {summary && summary.geographicDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={summary.geographicDistribution}
                    dataKey="count"
                    nameKey="country"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {summary.geographicDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No geographic data available
              </div>
            )}
          </div>
        </div>

        {/* Top IPs and Alert Thresholds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top 10 Requesting IPs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              Top 10 Requesting IPs
            </h3>
            <div className="space-y-2">
              {summary && summary.topIPs.length > 0 ? (
                summary.topIPs.map((ip, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      ip.count > thresholds.maxSameIPRequestsPerMinute 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">#{idx + 1}</span>
                      <span className="text-sm font-mono text-gray-900">{ip.ip}</span>
                      {ip.count > thresholds.maxSameIPRequestsPerMinute && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{ip.count} req</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Alert Thresholds Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alert Thresholds
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Requests/Min
                </label>
                <input
                  type="number"
                  value={thresholds.maxRequestsPerMinute}
                  onChange={(e) => setThresholds({ ...thresholds, maxRequestsPerMinute: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Same IP Requests/Min
                </label>
                <input
                  type="number"
                  value={thresholds.maxSameIPRequestsPerMinute}
                  onChange={(e) => setThresholds({ ...thresholds, maxSameIPRequestsPerMinute: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Error Rate (%)
                </label>
                <input
                  type="number"
                  value={thresholds.maxErrorRate}
                  onChange={(e) => setThresholds({ ...thresholds, maxErrorRate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Response Time (s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.maxResponseTime}
                  onChange={(e) => setThresholds({ ...thresholds, maxResponseTime: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Recent Requests (Last 50)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Endpoint</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Response Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Country</th>
                </tr>
              </thead>
              <tbody>
                {summary && summary.recentRequests.map((request, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">
                      {request.endpoint}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-900">
                      {request.ip_address}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        request.status_code < 400 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status_code < 400 ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {request.status_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {request.response_time.toFixed(2)}s
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {request.country || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!summary || summary.recentRequests.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No recent requests
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
