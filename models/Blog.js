import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Sayed Safi'
  },
  bio: {
    type: String,
    default: 'Full-Stack Web Developer specializing in modern web technologies'
  },
  image: {
    type: String,
    default: '/api/placeholder/100/100'
  }
});

const blogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  image: {
    type: String,
    default: '/api/placeholder/1200/630'
  },
  link: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: authorSchema,
    default: {
      name: 'Sayed Safi',
      bio: 'Full-Stack Web Developer specializing in modern web technologies',
      image: '/api/placeholder/100/100'
    }
  },
  published: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  // Public engagement (kept lightweight for performance)
  commentsCount: {
    type: Number,
    default: 0
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  ratingsTotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, date: -1 });
blogSchema.index({ category: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

