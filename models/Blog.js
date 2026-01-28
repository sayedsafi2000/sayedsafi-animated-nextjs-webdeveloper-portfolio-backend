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
  imageAlt: {
    type: String,
    trim: true,
    default: ''
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
  // SEO Fields
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  focusKeyword: {
    type: String,
    trim: true
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  robots: {
    index: {
      type: Boolean,
      default: true
    },
    follow: {
      type: Boolean,
      default: true
    }
  },
  // Social Media SEO
  ogTitle: {
    type: String,
    trim: true
  },
  ogDescription: {
    type: String,
    trim: true
  },
  ogImage: {
    type: String,
    trim: true
  },
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image'],
    default: 'summary_large_image'
  },
  // Schema & Meta
  schemaType: {
    type: String,
    enum: ['BlogPosting', 'Article'],
    default: 'BlogPosting'
  },
  breadcrumbsEnabled: {
    type: Boolean,
    default: true
  },
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'published'
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  // Additional Fields
  featured: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  // Auto-generated fields
  tableOfContents: {
    type: [{
      id: String,
      text: String,
      level: Number
    }],
    default: []
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
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ featured: -1, date: -1 });

// Pre-save hook to sync published status with status field
blogSchema.pre('save', function(next) {
  // Sync published field with status
  // Handle legacy posts that don't have status field
  if (this.status === 'published') {
    this.published = true;
    if (!this.publishedAt) {
      this.publishedAt = new Date();
    }
  } else if (this.status === 'draft' || this.status === 'scheduled') {
    this.published = false;
  } else if (this.status === undefined || this.status === null) {
    // Legacy post without status field - keep published field as is
    // If published is true but no status, set status to 'published'
    if (this.published && !this.status) {
      this.status = 'published';
      if (!this.publishedAt) {
        this.publishedAt = this.date || new Date();
      }
    }
    // Don't change published field for legacy posts
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

