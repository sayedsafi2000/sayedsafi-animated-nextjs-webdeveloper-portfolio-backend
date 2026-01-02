import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    required: [true, 'Icon name is required'],
    enum: ['Code', 'Globe', 'Palette', 'Database', 'Mobile', 'Cloud'],
    default: 'Code'
  },
  color: {
    type: String,
    required: [true, 'Color gradient is required'],
    default: 'from-blue-500 to-cyan-500'
  },
  features: [{
    type: String,
    trim: true
  }],
  price: {
    type: String,
    default: 'Custom'
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
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

// Index
serviceSchema.index({ active: 1, order: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;

