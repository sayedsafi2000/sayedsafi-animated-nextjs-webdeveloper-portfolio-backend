import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog reference is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [80, 'Name cannot exceed 80 characters'],
  },
  // Optional — kept private by default (not selected in queries)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    select: false,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [5, 'Message must be at least 5 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  // Optional rating (1–5). Kept lightweight (avg/count stored on Blog)
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  approved: {
    type: Boolean,
    default: true,
    index: true,
  },
  // Minimal anti-abuse metadata (not returned by default)
  ip: {
    type: String,
    select: false,
  },
  userAgent: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
});

commentSchema.index({ blog: 1, approved: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;

