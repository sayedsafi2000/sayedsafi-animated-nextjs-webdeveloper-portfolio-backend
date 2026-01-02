import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Service from '../models/Service.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services (public)
// @access  Public
router.get('/', [
  query('active').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const { active, limit = 100, page = 1 } = req.query;
    
    // Build query
    const query = {};
    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      // Default: only show active services for public
      query.active = true;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get services
    const services = await Service.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/services
// @desc    Create new service
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  body('color').trim().notEmpty().withMessage('Color gradient is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Process features - convert string to array if needed
    let features = req.body.features;
    if (typeof features === 'string') {
      // Handle both comma-separated and newline-separated
      features = features.split(/[,\n]/).map(feature => feature.trim()).filter(feature => feature);
    } else if (!Array.isArray(features)) {
      features = [];
    } else {
      features = features.map(feature => typeof feature === 'string' ? feature.trim() : feature).filter(feature => feature);
    }

    const serviceData = {
      ...req.body,
      features
    };

    const service = await Service.create(serviceData);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('icon').optional().trim().notEmpty(),
  body('color').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Process features - convert string to array if needed
    let features = req.body.features;
    if (features !== undefined) {
      if (typeof features === 'string') {
        // Handle both comma-separated and newline-separated
        features = features.split(/[,\n]/).map(feature => feature.trim()).filter(feature => feature);
      } else if (!Array.isArray(features)) {
        features = [];
      } else {
        features = features.map(feature => typeof feature === 'string' ? feature.trim() : feature).filter(feature => feature);
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    if (features !== undefined) {
      updateData.features = features;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

