import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  link: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  isCustomCode: {
    type: Boolean,
    default: true
  },
  order: {
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

// Indexes
projectSchema.index({ featured: -1, order: 1 });
projectSchema.index({ isCustomCode: 1 });
projectSchema.index({ category: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

