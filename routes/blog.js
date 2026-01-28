import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import { protect, authorize } from '../middleware/auth.js';
import { calculateReadingTime, generateTableOfContents, validateContentSEO } from '../utils/blogUtils.js';

const router = express.Router();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

// @route   GET /api/blog
// @desc    Get all blog posts (public)
// @access  Public
router.get('/', [
  query('published').optional().isBoolean(),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const { published, category, search, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {};
    // Only filter by published if explicitly provided as 'true' or 'false'
    // If published parameter is not provided, show all (for admin dashboard)
    if (published !== undefined && published !== '' && (published === 'true' || published === 'false')) {
      // Use published field for filtering (backward compatible with existing posts)
      // Status field is synced by pre-save hook but we filter by published for compatibility
      query.published = published === 'true';
    }
    // If no published parameter or invalid value, don't filter (show all blogs)
    if (category) {
      query.category = category;
    }
    
    // Search functionality - search in title, excerpt, and tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Blog query:', JSON.stringify(query, null, 2));
    }

    // Get posts
    const posts = await Blog.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Don't send full content in list

    // Get total count
    const total = await Blog.countDocuments(query);
    
    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${posts.length} posts (total: ${total})`);
    }

    res.json({
      success: true,
      data: {
        posts: posts.map((p) => {
          const ratingsCount = p.ratingsCount || 0;
          const ratingsTotal = p.ratingsTotal || 0;
          const ratingsAverage = ratingsCount > 0 ? Math.round((ratingsTotal / ratingsCount) * 10) / 10 : 0;
          return {
            ...p.toObject(),
            ratingsAverage,
          };
        }),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/:slug/comments
// @desc    Get comments for a blog post (public)
// @access  Public
router.get('/:slug/comments', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { limit = 10, page = 1 } = req.query;
    const safeLimit = parseInt(limit);
    const safePage = parseInt(page);
    const skip = (safePage - 1) * safeLimit;

    const post = await Blog.findOne({ slug: req.params.slug })
      .select('_id published commentsCount ratingsCount ratingsTotal');
    if (!post || !post.published) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ blog: post._id, approved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select('name message rating createdAt'),
      Comment.countDocuments({ blog: post._id, approved: true })
    ]);

    const ratingsCount = post.ratingsCount || 0;
    const ratingsTotal = post.ratingsTotal || 0;
    const ratingsAverage = ratingsCount > 0 ? Math.round((ratingsTotal / ratingsCount) * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        comments,
        stats: {
          commentsCount: post.commentsCount || 0,
          ratingsCount,
          ratingsTotal,
          ratingsAverage,
        },
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit),
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/blog/:slug/comments
// @desc    Create a new comment (public)
// @access  Public
router.post('/:slug/comments', [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
  body('rating')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  // Honeypot field (bots often fill this)
  body('website')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 200 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Honeypot: silently accept but don't store (anti-spam)
    if (req.body.website) {
      return res.status(201).json({
        success: true,
        message: 'Comment submitted',
      });
    }

    const post = await Blog.findOne({ slug: req.params.slug })
      .select('_id published commentsCount ratingsCount ratingsTotal');
    if (!post || !post.published) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const rating = req.body.rating !== undefined && req.body.rating !== null && req.body.rating !== ''
      ? parseInt(req.body.rating)
      : undefined;

    const comment = await Comment.create({
      blog: post._id,
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      ...(rating ? { rating } : {}),
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] || '',
      approved: true,
    });

    const update = { $inc: { commentsCount: 1 } };
    if (rating) {
      update.$inc.ratingsCount = 1;
      update.$inc.ratingsTotal = rating;
    }
    await Blog.updateOne({ _id: post._id }, update);

    // Re-fetch small stats (cheap) for UI update
    const updated = await Blog.findById(post._id).select('commentsCount ratingsCount ratingsTotal');
    const ratingsCount = updated?.ratingsCount || 0;
    const ratingsTotal = updated?.ratingsTotal || 0;
    const ratingsAverage = ratingsCount > 0 ? Math.round((ratingsTotal / ratingsCount) * 10) / 10 : 0;

    res.status(201).json({
      success: true,
      message: 'Comment submitted',
      data: {
        comment: {
          _id: comment._id,
          name: comment.name,
          message: comment.message,
          rating: comment.rating,
          createdAt: comment.createdAt,
        },
        stats: {
          commentsCount: updated?.commentsCount || 0,
          ratingsCount,
          ratingsTotal,
          ratingsAverage,
        }
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get single blog post by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    const ratingsCount = post.ratingsCount || 0;
    const ratingsTotal = post.ratingsTotal || 0;
    const ratingsAverage = ratingsCount > 0 ? Math.round((ratingsTotal / ratingsCount) * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        post: {
          ...post.toObject(),
          ratingsAverage,
        }
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/blog
// @desc    Create new blog post
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if slug already exists
    const existingPost = await Blog.findOne({ slug: req.body.slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: 'Blog post with this slug already exists'
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

    // Auto-calculate reading time if not provided or content changed
    let readTime = req.body.readTime;
    if (req.body.content && (!readTime || readTime === '5 min read')) {
      readTime = calculateReadingTime(req.body.content);
    }

    // Auto-generate table of contents
    const tableOfContents = req.body.content ? generateTableOfContents(req.body.content) : [];

    // Handle status and publishedAt
    let status = req.body.status || (req.body.published ? 'published' : 'draft');
    let publishedAt = req.body.publishedAt;
    
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }
    
    if (status === 'scheduled' && req.body.scheduledAt) {
      publishedAt = new Date(req.body.scheduledAt);
    }

    // Process robots object if provided
    let robots = { index: true, follow: true };
    if (req.body.robots) {
      if (typeof req.body.robots === 'object') {
        robots = {
          index: req.body.robots.index !== undefined ? req.body.robots.index : true,
          follow: req.body.robots.follow !== undefined ? req.body.robots.follow : true
        };
      }
    }

    const postData = {
      ...req.body,
      tags,
      readTime,
      tableOfContents,
      status,
      publishedAt,
      robots,
      // Sync published field with status
      published: status === 'published'
    };

    const post = await Blog.create(postData);

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title').optional().trim().notEmpty(),
  body('slug').optional().trim().notEmpty(),
  body('excerpt').optional().trim().notEmpty(),
  body('content').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if slug is being changed and if it already exists
    if (req.body.slug) {
      const existingPost = await Blog.findOne({ 
        slug: req.body.slug,
        _id: { $ne: req.params.id }
      });
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'Blog post with this slug already exists'
        });
      }
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

    // Initialize update data
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    if (tags !== undefined) {
      updateData.tags = tags;
    }

    // Auto-calculate reading time if content changed
    if (req.body.content) {
      updateData.readTime = calculateReadingTime(req.body.content);
      updateData.tableOfContents = generateTableOfContents(req.body.content);
    }

    // Handle status and publishedAt
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
      updateData.published = req.body.status === 'published';
      
      if (req.body.status === 'published' && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }
      
      if (req.body.status === 'scheduled' && req.body.scheduledAt) {
        updateData.publishedAt = new Date(req.body.scheduledAt);
      }
    } else if (req.body.published !== undefined) {
      // Legacy support: if published boolean is provided, sync status
      updateData.status = req.body.published ? 'published' : 'draft';
      updateData.published = req.body.published;
      if (req.body.published && !updateData.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Process robots object if provided
    if (req.body.robots) {
      if (typeof req.body.robots === 'object') {
        updateData.robots = {
          index: req.body.robots.index !== undefined ? req.body.robots.index : true,
          follow: req.body.robots.follow !== undefined ? req.body.robots.follow : true
        };
      }
    }

    const post = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/blog/validate-seo
// @desc    Validate content for SEO best practices
// @access  Private (Admin only)
router.post('/validate-seo', protect, authorize('admin'), [
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const validation = validateContentSEO(req.body.content);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('SEO validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/blog/categories
// @desc    Get all unique categories with counts (public)
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { published: true });
    
    // Get count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Blog.countDocuments({ 
          category, 
          published: true 
        });
        return {
          name: category,
          count
        };
      })
    );
    
    // Sort by count (descending) then by name
    categoriesWithCounts.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
    
    res.json({
      success: true,
      data: {
        categories: categoriesWithCounts.map(c => c.name),
        categoriesWithCounts
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

