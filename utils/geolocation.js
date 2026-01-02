/**
 * Geolocation utility
 * Detects country from IP address (transiently, does not store IP)
 * Uses free IP geolocation API
 */

/**
 * Get country information from IP address
 * @param {string} ip - IP address (will not be stored)
 * @returns {Promise<{country: string, countryCode: string, city: string, region: string}>}
 */
export async function getCountryFromIP(ip) {
  try {
    // Skip localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        city: 'Unknown',
        region: 'Unknown'
      };
    }

    // Use ipapi.co free API (no key required for basic usage)
    // Alternative: ip-api.com (free tier available)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Portfolio-Analytics/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geolocation API error');
    }

    const data = await response.json();

    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown'
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    // Return default values on error
    return {
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
}

/**
 * Extract IP address from request
 * Handles various proxy headers
 * @param {Request} req - Express request object
 * @returns {string} - IP address
 */
export function getIPFromRequest(req) {
  // Check various headers (for proxies, load balancers, etc.)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || 'unknown';
}

/**
 * Parse user agent to extract device, browser, OS
 * @param {string} userAgent - User agent string
 * @returns {{device: string, browser: string, os: string}}
 */
export function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      device: 'unknown',
      browser: 'unknown',
      os: 'unknown'
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect device
  let device = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet';
  }

  // Detect browser
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  return { device, browser, os };
}

/**
 * Parse referrer to extract domain
 * @param {string} referrer - Referrer URL
 * @returns {{referrer: string, referrerDomain: string}}
 */
export function parseReferrer(referrer) {
  if (!referrer || referrer === 'direct' || referrer === '') {
    return {
      referrer: 'direct',
      referrerDomain: null
    };
  }

  try {
    const url = new URL(referrer);
    return {
      referrer: referrer,
      referrerDomain: url.hostname.replace('www.', '')
    };
  } catch (error) {
    return {
      referrer: referrer,
      referrerDomain: null
    };
  }
}

