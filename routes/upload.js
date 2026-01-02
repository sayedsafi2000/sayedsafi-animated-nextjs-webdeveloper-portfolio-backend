import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { protect, authorize } from '../middleware/auth.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), (req, res, next) => {
  console.log('Upload route hit, setting up multer...');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
          code: err.code
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    console.log('Multer processing complete, file:', req.file ? 'received' : 'not received');
    next();
  });
}, async (req, res) => {
  try {
    console.log('Handler started, checking file...');
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request file:', req.file ? 'exists' : 'missing');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please select an image file.'
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
      fieldname: req.file.fieldname
    });

    // Validate buffer exists
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File buffer is empty'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'sayed-safi-portfolio', req.file.mimetype);

    if (!result || !result.secure_url) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed - no URL returned from Cloudinary'
      });
    }

    console.log('Upload successful:', result.secure_url);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        secure_url: result.secure_url
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.stack,
        details: error
      })
    });
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete image from Cloudinary
// @access  Private (Admin only)
router.delete('/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Extract public_id from the full path if needed
    const public_id = publicId.includes('/') 
      ? publicId.split('/').slice(-2).join('/').split('.')[0]
      : publicId;

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

export default router;

