import express from 'express';
import Visit from '../models/Visit.js';
import Event from '../models/Event.js';
import { getIPFromRequest, getCountryFromIP, parseUserAgent, parseReferrer } from '../utils/geolocation.js';
import { generateSessionId, hasDoNotTrack } from '../utils/session.js';

const router = express.Router();

// Test route to verify track router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Track routes are working' });
});

/**
 * POST /api/track/visit
 * Track a page visit
 * Privacy-friendly: no IP storage, respects DNT
 */
router.post('/visit', async (req, res) => {
  try {
    // Check Do Not Track header
    if (hasDoNotTrack(req)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Tracking skipped (Do Not Track)' 
      });
    }

    const { page, path, referrer: clientReferrer, sessionId: clientSessionId } = req.body;
    
    if (!page || !path) {
      return res.status(400).json({ 
        success: false, 
        message: 'Page and path are required' 
      });
    }

    // Get IP (transiently, for geolocation only)
    const ip = getIPFromRequest(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // Generate session ID if not provided
    const sessionId = clientSessionId || generateSessionId(ip, userAgent, new Date());
    
    // Check if this is a unique visitor (first visit today with this session ID)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingVisit = await Visit.findOne({
      sessionId,
      timestamp: { $gte: today }
    });

    const isUnique = !existingVisit;

    // Get geolocation (IP used transiently, not stored)
    const geo = await getCountryFromIP(ip);
    
    // Parse user agent
    const { device, browser, os } = parseUserAgent(userAgent);
    
    // Parse referrer
    const referrerData = parseReferrer(clientReferrer || req.headers.referer || 'direct');

    // Create visit record (NO IP stored)
    const visit = await Visit.create({
      page,
      path,
      sessionId,
      isUnique,
      device,
      browser,
      os,
      userAgent,
      referrer: referrerData.referrer,
      referrerDomain: referrerData.referrerDomain,
      country: geo.country,
      countryCode: geo.countryCode,
      city: geo.city,
      region: geo.region,
      timestamp: new Date(),
      doNotTrack: false
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: visit.sessionId,
        isUnique: visit.isUnique
      }
    });
  } catch (error) {
    console.error('Visit tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track visit'
    });
  }
});

/**
 * POST /api/track/event
 * Track a custom event
 */
router.post('/event', async (req, res) => {
  try {
    // Check Do Not Track header
    if (hasDoNotTrack(req)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Tracking skipped (Do Not Track)' 
      });
    }

    const { eventName, page, path, metadata, sessionId: clientSessionId } = req.body;
    
    if (!eventName || !page || !path) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event name, page, and path are required' 
      });
    }

    // Get IP transiently for geolocation
    const ip = getIPFromRequest(req);
    const sessionId = clientSessionId || generateSessionId(ip, req.headers['user-agent'] || '', new Date());
    
    // Get country (optional, for analytics)
    const geo = await getCountryFromIP(ip);

    // Create event record
    const event = await Event.create({
      eventName,
      page,
      path,
      metadata: metadata || {},
      sessionId,
      country: geo.country,
      countryCode: geo.countryCode,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        eventId: event._id
      }
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
});

export default router;

