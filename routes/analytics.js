import express from 'express';
import Visit from '../models/Visit.js';
import Event from '../models/Event.js';
import Lead from '../models/Lead.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Test route (before auth) to verify analytics router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Analytics routes are working', timestamp: new Date().toISOString() });
});

// All other routes require admin authentication
router.use(protect, authorize('admin'));

/**
 * GET /api/analytics/overview
 * Get overview statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get statistics in parallel
    const [
      totalVisits,
      uniqueVisitors,
      totalLeads,
      newLeads,
      totalEvents
    ] = await Promise.all([
      // Total visits
      Visit.countDocuments(dateFilter),
      
      // Unique visitors (count distinct sessionIds)
      Visit.distinct('sessionId', dateFilter).then(ids => ids.length),
      
      // Total leads
      Lead.countDocuments(),
      
      // New leads
      Lead.countDocuments({ status: 'new' }),
      
      // Total events
      Event.countDocuments(dateFilter)
    ]);

    res.json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        totalLeads,
        newLeads,
        totalEvents
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
});

/**
 * GET /api/analytics/traffic
 * Get traffic over time (daily/monthly)
 */
router.get('/traffic', async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Determine date format based on period
    const dateFormat = period === 'monthly' 
      ? { year: { $year: '$timestamp' }, month: { $month: '$timestamp' } }
      : { year: { $year: '$timestamp' }, month: { $month: '$timestamp' }, day: { $dayOfMonth: '$timestamp' } };

    // Aggregate visits by date
    const traffic = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: dateFormat,
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: period === 'daily' ? '$_id.day' : 1
            }
          },
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: { traffic }
    });
  } catch (error) {
    console.error('Traffic analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic data'
    });
  }
});

/**
 * GET /api/analytics/countries
 * Get visitors by country
 */
router.get('/countries', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Aggregate by country
    const countries = await Visit.aggregate([
      { $match: { ...dateFilter, country: { $ne: 'Unknown' } } },
      {
        $group: {
          _id: '$country',
          countryCode: { $first: '$countryCode' },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          countryCode: 1,
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { countries }
    });
  } catch (error) {
    console.error('Countries analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch country data'
    });
  }
});

/**
 * GET /api/analytics/pages
 * Get most visited pages
 */
router.get('/pages', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Aggregate by page
    const pages = await Visit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$page',
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          page: '$_id',
          visits: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      { $sort: { visits: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    console.error('Pages analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page data'
    });
  }
});

/**
 * GET /api/analytics/events
 * Get event statistics
 */
router.get('/events', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Aggregate by event name
    const events = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          eventName: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Events analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event data'
    });
  }
});

/**
 * GET /api/analytics/recent-visits
 * Get recent visits
 */
router.get('/recent-visits', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const visits = await Visit.find()
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('page path device browser country timestamp')
      .lean();

    res.json({
      success: true,
      data: { visits }
    });
  } catch (error) {
    console.error('Recent visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent visits'
    });
  }
});

/**
 * GET /api/analytics/export/visits
 * Export visits as CSV (admin only)
 */
router.get('/export/visits', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    const visits = await Visit.find(dateFilter)
      .sort({ timestamp: -1 })
      .select('page path device browser country city timestamp')
      .lean();

    // Convert to CSV
    const headers = ['Page', 'Path', 'Device', 'Browser', 'Country', 'City', 'Timestamp'];
    const rows = visits.map(v => [
      v.page,
      v.path,
      v.device,
      v.browser,
      v.country,
      v.city,
      new Date(v.timestamp).toISOString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=visits.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export visits'
    });
  }
});

/**
 * GET /api/analytics/export/leads
 * Export leads as CSV (admin only)
 */
router.get('/export/leads', async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .select('name email message page country status createdAt')
      .lean();

    // Convert to CSV
    const headers = ['Name', 'Email', 'Message', 'Page', 'Country', 'Status', 'Created At'];
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.message.replace(/"/g, '""'),
      l.page,
      l.country,
      l.status,
      new Date(l.createdAt).toISOString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export leads'
    });
  }
});

export default router;

