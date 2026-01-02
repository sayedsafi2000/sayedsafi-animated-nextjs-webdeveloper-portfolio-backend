/**
 * Session utility
 * Generates session IDs for tracking unique visitors
 * Privacy-friendly: no cookies, no localStorage
 * Uses hash of IP + User-Agent + timestamp (first visit)
 */

import crypto from 'crypto';

/**
 * Generate a session ID from request data
 * This is a privacy-friendly way to track sessions without storing IPs
 * @param {string} ip - IP address (will be hashed)
 * @param {string} userAgent - User agent string
 * @param {Date} timestamp - Timestamp
 * @returns {string} - Hashed session ID
 */
export function generateSessionId(ip, userAgent, timestamp) {
  // Create a hash from IP + User-Agent + date (not time)
  // This ensures same visitor on same day gets same session ID
  const date = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  const data = `${ip}-${userAgent}-${date}`;
  
  // Create SHA-256 hash
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  // Return first 16 characters (sufficient for uniqueness)
  return hash.substring(0, 16);
}

/**
 * Check if request has Do Not Track header
 * @param {Request} req - Express request object
 * @returns {boolean}
 */
export function hasDoNotTrack(req) {
  const dnt = req.headers['dnt'] || req.headers['do-not-track'];
  return dnt === '1' || dnt === 'true';
}

