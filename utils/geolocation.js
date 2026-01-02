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
    if (!ip || 
        ip === '::1' || 
        ip === '127.0.0.1' || 
        ip === 'unknown' ||
        ip.startsWith('192.168.') || 
        ip.startsWith('10.') || 
        ip.startsWith('172.') ||
        ip.startsWith('::ffff:192.168.') ||
        ip.startsWith('::ffff:10.') ||
        ip.startsWith('::ffff:172.')) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        city: 'Unknown',
        region: 'Unknown'
      };
    }

    // Clean IPv6-mapped IPv4 addresses
    const cleanIP = ip.replace(/^::ffff:/, '');

    // Try ip-api.com first (more reliable, free tier: 45 requests/minute)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response1 = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,message,country,countryCode,city,regionName`, {
        headers: {
          'User-Agent': 'Portfolio-Analytics/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response1.ok) {
        const data1 = await response1.json();
        
        // Check if API returned valid data
        if (data1.status === 'success' && data1.country && data1.countryCode) {
          return {
            country: data1.country || 'Unknown',
            countryCode: (data1.countryCode || 'XX').toUpperCase(),
            city: data1.city || 'Unknown',
            region: data1.regionName || 'Unknown'
          };
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('ip-api.com failed, trying fallback...', error.message);
      }
    }

    // Fallback to ipapi.co
    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
      
      const response2 = await fetch(`https://ipapi.co/${cleanIP}/json/`, {
        headers: {
          'User-Agent': 'Portfolio-Analytics/1.0'
        },
        signal: controller2.signal
      });

      clearTimeout(timeoutId2);

      if (response2.ok) {
        const data2 = await response2.json();
        
        // Check for error responses from ipapi.co
        if (data2.error) {
          throw new Error(data2.reason || 'API error');
        }

        // Validate that we got actual country data
        if (data2.country_name && data2.country_code && data2.country_code !== 'XX') {
          return {
            country: data2.country_name || 'Unknown',
            countryCode: (data2.country_code || 'XX').toUpperCase(),
            city: data2.city || 'Unknown',
            region: data2.region || 'Unknown'
          };
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('ipapi.co also failed', error.message);
      }
    }

    // If both APIs fail, return Unknown
    return {
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown'
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

