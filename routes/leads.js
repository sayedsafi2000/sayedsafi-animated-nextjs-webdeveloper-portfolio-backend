import express from 'express';
import Lead from '../models/Lead.js';
import { getIPFromRequest, getCountryFromIP } from '../utils/geolocation.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Test route (public) to verify leads router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Leads routes are working' });
});

/**
 * POST /api/leads/create
 * Create a new lead from contact form
 * Public endpoint
 */
router.post('/create', async (req, res) => {
  try {
    const { name, email, message, page, path } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Get IP transiently for geolocation
    const ip = getIPFromRequest(req);
    const geo = await getCountryFromIP(ip);

    // Create lead
    const lead = await Lead.create({
      name,
      email,
      message,
      page: page || 'contact',
      path: path || '/contact',
      country: geo.country,
      countryCode: geo.countryCode,
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: {
        leadId: lead._id
      }
    });
  } catch (error) {
    console.error('Lead creation error:', error);
    
    // Handle duplicate email (if unique index exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create lead'
    });
  }
});

/**
 * GET /api/leads
 * Get all leads (admin only)
 * Supports pagination, search, filtering
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('contactedBy', 'username email')
        .lean(),
      Lead.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
});

/**
 * GET /api/leads/:id
 * Get a single lead (admin only)
 */
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('contactedBy', 'username email')
      .lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead'
    });
  }
});

/**
 * PUT /api/leads/:id
 * Update lead status (admin only)
 */
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const user = req.user;

    const updateData = {};
    
    if (status) {
      if (!['new', 'contacted', 'closed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      updateData.status = status;
      
      // If marking as contacted, set contactedAt and contactedBy
      if (status === 'contacted' && !updateData.contactedAt) {
        updateData.contactedAt = new Date();
        updateData.contactedBy = user._id;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('contactedBy', 'username email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead'
    });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete a lead (admin only)
 */
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead'
    });
  }
});

export default router;

