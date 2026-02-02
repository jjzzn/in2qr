import { supabase } from './supabase';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter: number;
}

export interface RateLimitError extends Error {
  rateLimitInfo: RateLimitInfo;
}

/**
 * Check if the current user/IP has exceeded the rate limit
 * @param endpoint - The endpoint being rate limited (e.g., '/api/create-qr')
 * @param config - Rate limit configuration
 * @throws {RateLimitError} If rate limit is exceeded
 */
export async function checkRateLimit(
  endpoint: string,
  config: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour default
  }
): Promise<void> {
  try {
    // Get client IP (fallback to user ID if available)
    const ipAddress = await getClientIp();
    
    // Calculate time window
    const windowStart = new Date(Date.now() - config.windowMs);
    
    // Count requests in the current window
    const { count, error } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .eq('endpoint', endpoint)
      .gte('timestamp', windowStart.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      // Don't block on error, allow the request
      return;
    }

    const requestCount = count || 0;
    const resetTime = new Date(Date.now() + config.windowMs);
    const retryAfter = Math.ceil(config.windowMs / 1000); // seconds

    // If limit exceeded, throw error
    if (requestCount >= config.maxRequests) {
      const rateLimitError = new Error('Rate limit exceeded') as RateLimitError;
      rateLimitError.rateLimitInfo = {
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
      throw rateLimitError;
    }

    // Log this check (optional - for analytics)
    console.log(`Rate limit check: ${requestCount}/${config.maxRequests} requests used`);
  } catch (error) {
    // Re-throw rate limit errors
    if ((error as RateLimitError).rateLimitInfo) {
      throw error;
    }
    // For other errors, log and allow request
    console.error('Rate limit check failed:', error);
  }
}

/**
 * Log a request for rate limiting purposes
 * @param endpoint - The endpoint being accessed
 * @param metadata - Additional metadata to store
 */
export async function logRequest(
  endpoint: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const ipAddress = await getClientIp();
    const userAgent = navigator.userAgent;

    await supabase.from('request_logs').insert({
      ip_address: ipAddress,
      endpoint,
      method: 'POST',
      user_agent: userAgent,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log request:', error);
  }
}

/**
 * Get a user-friendly rate limit error message
 * @param error - The rate limit error
 * @returns Formatted error message
 */
export function getRateLimitMessage(error: RateLimitError): string {
  const { rateLimitInfo } = error;
  
  if (!rateLimitInfo) {
    return 'An error occurred. Please try again.';
  }

  const resetTime = rateLimitInfo.reset.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const minutesUntilReset = Math.ceil(rateLimitInfo.retryAfter / 60);

  return `คุณสร้าง QR Code เกินจำนวนที่กำหนดแล้ว (${rateLimitInfo.limit} QR codes ต่อชั่วโมง)\n\nกรุณารออีก ${minutesUntilReset} นาที หรือรอจนถึงเวลา ${resetTime} น.`;
}

/**
 * Get client IP address
 * Uses multiple methods to try to get the real IP
 */
async function getClientIp(): Promise<string> {
  try {
    // Try to get from Supabase auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      return `user_${user.id}`;
    }

    // Fallback: Try to get from external service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    // Fallback to a session-based identifier
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

/**
 * Get current rate limit status without throwing an error
 * @param endpoint - The endpoint to check
 * @param config - Rate limit configuration
 * @returns Current rate limit info
 */
export async function getRateLimitStatus(
  endpoint: string,
  config: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  }
): Promise<RateLimitInfo> {
  try {
    const ipAddress = await getClientIp();
    const windowStart = new Date(Date.now() - config.windowMs);

    const { count } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .eq('endpoint', endpoint)
      .gte('timestamp', windowStart.toISOString());

    const requestCount = count || 0;
    const remaining = Math.max(0, config.maxRequests - requestCount);
    const resetTime = new Date(Date.now() + config.windowMs);
    const retryAfter = Math.ceil(config.windowMs / 1000);

    return {
      limit: config.maxRequests,
      remaining,
      reset: resetTime,
      retryAfter,
    };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: new Date(Date.now() + config.windowMs),
      retryAfter: Math.ceil(config.windowMs / 1000),
    };
  }
}
