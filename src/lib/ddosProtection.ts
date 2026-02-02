import { supabase } from './supabase';

export interface DDoSConfig {
  // Rate limits
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  
  // IP-based limits
  maxIPRequestsPerMinute: number;
  maxIPRequestsPerHour: number;
  
  // Pattern detection
  minRequestInterval: number; // milliseconds
  maxBurstRequests: number;
  
  // Blacklist
  blacklistDuration: number; // milliseconds
  autoBlacklistThreshold: number;
}

export const defaultDDoSConfig: DDoSConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 500,
  maxRequestsPerDay: 2000,
  maxIPRequestsPerMinute: 20,
  maxIPRequestsPerHour: 100,
  minRequestInterval: 100, // 100ms minimum between requests
  maxBurstRequests: 10, // max 10 requests in burst
  blacklistDuration: 24 * 60 * 60 * 1000, // 24 hours
  autoBlacklistThreshold: 50, // auto-blacklist after 50 violations
};

export interface DDoSCheckResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
  resetTime?: Date;
  isBlacklisted?: boolean;
  violations?: number;
}

// In-memory cache for performance
const requestCache = new Map<string, number[]>();
const blacklistCache = new Set<string>();
const violationCache = new Map<string, number>();
let lastCleanup = Date.now();

/**
 * Comprehensive DDoS protection check
 */
export async function checkDDoSProtection(
  endpoint: string,
  config: DDoSConfig = defaultDDoSConfig
): Promise<DDoSCheckResult> {
  try {
    const clientId = await getClientIdentifier();
    const now = Date.now();

    // Cleanup old cache entries every 5 minutes
    if (now - lastCleanup > 5 * 60 * 1000) {
      cleanupCache();
      lastCleanup = now;
    }

    // 1. Check if IP is blacklisted
    const blacklistCheck = await checkBlacklist(clientId);
    if (blacklistCheck.isBlacklisted) {
      await logSecurityEvent('blacklist_block', clientId, endpoint);
      return blacklistCheck;
    }

    // 2. Check request patterns (burst detection)
    const burstCheck = checkBurstPattern(clientId, config);
    if (!burstCheck.allowed) {
      await recordViolation(clientId, 'burst_detected');
      return burstCheck;
    }

    // 3. Check rate limits (per minute, hour, day)
    const rateLimitCheck = await checkRateLimits(clientId, endpoint, config);
    if (!rateLimitCheck.allowed) {
      await recordViolation(clientId, 'rate_limit_exceeded');
      return rateLimitCheck;
    }

    // 4. Check IP-specific limits
    const ipLimitCheck = await checkIPLimits(clientId, config);
    if (!ipLimitCheck.allowed) {
      await recordViolation(clientId, 'ip_limit_exceeded');
      return ipLimitCheck;
    }

    // 5. Log successful request
    await logRequest(clientId, endpoint);

    return {
      allowed: true,
      remainingRequests: rateLimitCheck.remainingRequests,
      resetTime: rateLimitCheck.resetTime,
    };
  } catch (error) {
    console.error('DDoS protection check failed:', error);
    // Fail open - allow request on error
    return { allowed: true };
  }
}

/**
 * Check if IP/client is blacklisted
 */
async function checkBlacklist(clientId: string): Promise<DDoSCheckResult> {
  // Check in-memory cache first
  if (blacklistCache.has(clientId)) {
    return {
      allowed: false,
      reason: 'IP is blacklisted due to suspicious activity',
      isBlacklisted: true,
    };
  }

  // Check database
  try {
    const { data, error } = await supabase
      .from('ip_blacklist')
      .select('*')
      .eq('client_id', clientId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!error && data) {
      blacklistCache.add(clientId);
      return {
        allowed: false,
        reason: `IP blacklisted until ${new Date(data.expires_at).toLocaleString()}`,
        isBlacklisted: true,
      };
    }
  } catch (error) {
    // Not blacklisted or error
  }

  return { allowed: true };
}

/**
 * Detect burst patterns (too many requests too quickly)
 */
function checkBurstPattern(
  clientId: string,
  config: DDoSConfig
): DDoSCheckResult {
  const now = Date.now();
  const requests = requestCache.get(clientId) || [];
  
  // Filter requests within burst window (last 1 second)
  const recentRequests = requests.filter(
    (timestamp) => now - timestamp < 1000
  );

  // Check if burst limit exceeded
  if (recentRequests.length >= config.maxBurstRequests) {
    return {
      allowed: false,
      reason: `Too many requests in short time (${recentRequests.length} requests in 1 second)`,
    };
  }

  // Check minimum interval between requests
  if (recentRequests.length > 0) {
    const lastRequest = recentRequests[recentRequests.length - 1];
    const interval = now - lastRequest;
    
    if (interval < config.minRequestInterval) {
      return {
        allowed: false,
        reason: `Requests too frequent (${interval}ms interval, minimum ${config.minRequestInterval}ms)`,
      };
    }
  }

  // Update cache
  recentRequests.push(now);
  requestCache.set(clientId, recentRequests);

  return { allowed: true };
}

/**
 * Check rate limits (per minute, hour, day)
 */
async function checkRateLimits(
  clientId: string,
  _endpoint: string,
  config: DDoSConfig
): Promise<DDoSCheckResult> {
  const now = Date.now();

  // Check per-minute limit
  const oneMinuteAgo = new Date(now - 60 * 1000);
  const { count: minuteCount } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', clientId)
    .gte('timestamp', oneMinuteAgo.toISOString());

  if ((minuteCount || 0) >= config.maxRequestsPerMinute) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${minuteCount}/${config.maxRequestsPerMinute} requests per minute`,
      remainingRequests: 0,
      resetTime: new Date(now + 60 * 1000),
    };
  }

  // Check per-hour limit
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const { count: hourCount } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', clientId)
    .gte('timestamp', oneHourAgo.toISOString());

  if ((hourCount || 0) >= config.maxRequestsPerHour) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${hourCount}/${config.maxRequestsPerHour} requests per hour`,
      remainingRequests: 0,
      resetTime: new Date(now + 60 * 60 * 1000),
    };
  }

  // Check per-day limit
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const { count: dayCount } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', clientId)
    .gte('timestamp', oneDayAgo.toISOString());

  if ((dayCount || 0) >= config.maxRequestsPerDay) {
    return {
      allowed: false,
      reason: `Daily limit exceeded: ${dayCount}/${config.maxRequestsPerDay} requests per day`,
      remainingRequests: 0,
      resetTime: new Date(now + 24 * 60 * 60 * 1000),
    };
  }

  return {
    allowed: true,
    remainingRequests: config.maxRequestsPerMinute - (minuteCount || 0),
    resetTime: new Date(now + 60 * 1000),
  };
}

/**
 * Check IP-specific limits
 */
async function checkIPLimits(
  clientId: string,
  config: DDoSConfig
): Promise<DDoSCheckResult> {
  const now = Date.now();

  // Check IP requests per minute
  const oneMinuteAgo = new Date(now - 60 * 1000);
  const { count: ipMinuteCount } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', clientId)
    .gte('timestamp', oneMinuteAgo.toISOString());

  if ((ipMinuteCount || 0) >= config.maxIPRequestsPerMinute) {
    return {
      allowed: false,
      reason: `IP rate limit exceeded: ${ipMinuteCount}/${config.maxIPRequestsPerMinute} requests per minute from this IP`,
    };
  }

  // Check IP requests per hour
  const oneHourAgo = new Date(now - 60 * 60 * 1000);
  const { count: ipHourCount } = await supabase
    .from('request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', clientId)
    .gte('timestamp', oneHourAgo.toISOString());

  if ((ipHourCount || 0) >= config.maxIPRequestsPerHour) {
    return {
      allowed: false,
      reason: `IP rate limit exceeded: ${ipHourCount}/${config.maxIPRequestsPerHour} requests per hour from this IP`,
    };
  }

  return { allowed: true };
}

/**
 * Record security violation and auto-blacklist if threshold exceeded
 */
async function recordViolation(clientId: string, violationType: string) {
  const violations = (violationCache.get(clientId) || 0) + 1;
  violationCache.set(clientId, violations);

  // Log violation
  await supabase.from('security_events').insert({
    client_id: clientId,
    event_type: 'violation',
    violation_type: violationType,
    violation_count: violations,
  });

  // Auto-blacklist if threshold exceeded
  if (violations >= defaultDDoSConfig.autoBlacklistThreshold) {
    await blacklistIP(clientId, `Auto-blacklisted after ${violations} violations`);
  }
}

/**
 * Blacklist an IP/client
 */
export async function blacklistIP(
  clientId: string,
  reason: string,
  duration: number = defaultDDoSConfig.blacklistDuration
): Promise<void> {
  const expiresAt = new Date(Date.now() + duration);

  await supabase.from('ip_blacklist').insert({
    client_id: clientId,
    reason,
    expires_at: expiresAt.toISOString(),
  });

  blacklistCache.add(clientId);

  await logSecurityEvent('ip_blacklisted', clientId, reason);
}

/**
 * Remove IP from blacklist
 */
export async function unblacklistIP(clientId: string): Promise<void> {
  await supabase
    .from('ip_blacklist')
    .delete()
    .eq('client_id', clientId);

  blacklistCache.delete(clientId);
  violationCache.delete(clientId);

  await logSecurityEvent('ip_unblacklisted', clientId, 'Manual unblock');
}

/**
 * Log security event
 */
async function logSecurityEvent(
  eventType: string,
  clientId: string,
  details: string
): Promise<void> {
  try {
    await supabase.from('security_events').insert({
      client_id: clientId,
      event_type: eventType,
      details,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Log request for rate limiting
 */
async function logRequest(clientId: string, endpoint: string): Promise<void> {
  try {
    await supabase.from('request_logs').insert({
      ip_address: clientId,
      endpoint,
      method: 'POST',
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}

/**
 * Get client identifier (IP or user ID)
 */
async function getClientIdentifier(): Promise<string> {
  try {
    // Try to get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return `user_${user.id}`;
    }

    // Try to get IP from external service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    // Fallback to session ID
    let sessionId = sessionStorage.getItem('ddos_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('ddos_session_id', sessionId);
    }
    return sessionId;
  }
}

/**
 * Cleanup old cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  // Cleanup request cache
  for (const [clientId, timestamps] of requestCache.entries()) {
    const recent = timestamps.filter((t) => t > fiveMinutesAgo);
    if (recent.length === 0) {
      requestCache.delete(clientId);
    } else {
      requestCache.set(clientId, recent);
    }
  }

  // Cleanup violation cache (reset after 1 hour)
  for (const [clientId] of violationCache.entries()) {
    // Reset violations older than 1 hour
    violationCache.delete(clientId);
  }
}

/**
 * Get DDoS protection status
 */
export async function getDDoSStatus(_clientId?: string): Promise<{
  isProtected: boolean;
  blacklistedIPs: number;
  recentViolations: number;
  activeRequests: number;
}> {
  try {
    // Count blacklisted IPs
    const { count: blacklistCount } = await supabase
      .from('ip_blacklist')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString());

    // Count recent violations (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count: violationCount } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'violation')
      .gte('created_at', oneHourAgo.toISOString());

    // Count active requests (last minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const { count: requestCount } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', oneMinuteAgo.toISOString());

    return {
      isProtected: true,
      blacklistedIPs: blacklistCount || 0,
      recentViolations: violationCount || 0,
      activeRequests: requestCount || 0,
    };
  } catch (error) {
    console.error('Failed to get DDoS status:', error);
    return {
      isProtected: false,
      blacklistedIPs: 0,
      recentViolations: 0,
      activeRequests: 0,
    };
  }
}
