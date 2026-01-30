import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'expired'],
    default: 'draft'
  },
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
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
adSchema.index({ status: 1, startDate: 1, endDate: 1 });
adSchema.index({ priority: -1 });
adSchema.index({ status: 1, priority: -1 });

// Pre-save hook to update status based on dates
adSchema.pre('save', function(next) {
  const now = new Date();
  
  // Don't auto-update status if it's draft
  if (this.status === 'draft') {
    return next();
  }
  
  // Auto-update status based on dates
  if (this.endDate < now) {
    this.status = 'expired';
  } else if (this.startDate <= now && this.endDate >= now) {
    this.status = 'active';
  } else if (this.startDate > now) {
    this.status = 'draft'; // Not started yet
  }
  
  next();
});

// Method to check if ad is currently active
adSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

const Ad = mongoose.model('Ad', adSchema);

export default Ad;
