import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Ad from '../models/Ad.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/ads
// @desc    Get all ads (admin) or active ads (public)
// @access  Public (for active ads) / Private (for all ads)
router.get('/', [
  query('active').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { active, limit = 100 } = req.query;
    const now = new Date();
    
    let query = {};
    
    // If active=true, only return active ads within date range
    if (active === 'true') {
      query.status = 'active';
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }
    
    const ads = await Ad.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        ads: ads.map(ad => ({
          ...ad.toObject(),
          isActive: ad.isActive()
        }))
      }
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/ads/:id
// @desc    Get single ad
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      data: { ad }
    });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/ads
// @desc    Create new ad
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('image').trim().notEmpty().withMessage('Image URL is required'),
  body('link').trim().notEmpty().withMessage('Link is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  body('priority').optional().isInt({ min: 0, max: 100 }),
  body('status').optional().isIn(['draft', 'active', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { title, description, image, link, priority = 0, startDate, endDate, status = 'draft' } = req.body;
    
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    // Determine status based on dates if not explicitly set
    let adStatus = status;
    const now = new Date();
    if (status !== 'draft') {
      if (end < now) {
        adStatus = 'expired';
      } else if (start <= now && end >= now) {
        adStatus = 'active';
      } else if (start > now) {
        adStatus = 'draft';
      }
    }
    
    const ad = await Ad.create({
      title,
      description,
      image,
      link,
      priority: parseInt(priority),
      startDate: start,
      endDate: end,
      status: adStatus
    });
    
    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: { ad }
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/ads/:id
// @desc    Update ad
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('image').optional().trim().notEmpty(),
  body('link').optional().trim().notEmpty(),
  body('priority').optional().isInt({ min: 0, max: 100 }),
  body('status').optional().isIn(['draft', 'active', 'expired'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { startDate, endDate, status } = req.body;
    
    // Validate date range if dates are being updated
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }
    
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // Auto-update status based on dates if status is not explicitly set
    if (!status && (startDate || endDate)) {
      const ad = await Ad.findById(req.params.id);
      if (ad) {
        const start = startDate ? new Date(startDate) : ad.startDate;
        const end = endDate ? new Date(endDate) : ad.endDate;
        const now = new Date();
        
        if (ad.status !== 'draft') {
          if (end < now) {
            updateData.status = 'expired';
          } else if (start <= now && end >= now) {
            updateData.status = 'active';
          } else if (start > now) {
            updateData.status = 'draft';
          }
        }
      }
    }
    
    // Convert priority to number if provided
    if (updateData.priority !== undefined) {
      updateData.priority = parseInt(updateData.priority);
    }
    
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad updated successfully',
      data: { ad }
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/ads/:id
// @desc    Delete ad
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/ads/:id/click
// @desc    Track ad click
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    ad.clicks += 1;
    await ad.save();
    
    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/ads/:id/impression
// @desc    Track ad impression
// @access  Public
router.post('/:id/impression', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }
    
    ad.impressions += 1;
    await ad.save();
    
    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
