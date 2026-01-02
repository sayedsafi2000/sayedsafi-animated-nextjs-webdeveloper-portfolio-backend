import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Project from '../models/Project.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (public)
// @access  Public
router.get('/', [
  query('featured').optional().isBoolean(),
  query('isCustomCode').optional().isBoolean(),
  query('category').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const { featured, isCustomCode, category, limit = 100, page = 1 } = req.query;
    
    // Build query
    const query = {};
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    if (isCustomCode !== undefined) {
      query.isCustomCode = isCustomCode === 'true';
    }
    if (category) {
      query.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects
    const projects = await Project.find(query)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('image').notEmpty().withMessage('Image URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Process tags - convert string to array if needed
    let tags = req.body.tags;
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (!Array.isArray(tags)) {
      tags = [];
    } else {
      tags = tags.map(tag => typeof tag === 'string' ? tag.trim() : tag).filter(tag => tag);
    }

    const projectData = {
      ...req.body,
      tags
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Process tags - convert string to array if needed
    let tags = req.body.tags;
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (!Array.isArray(tags)) {
        tags = [];
      } else {
        tags = tags.map(tag => typeof tag === 'string' ? tag.trim() : tag).filter(tag => tag);
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    if (tags !== undefined) {
      updateData.tags = tags;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

