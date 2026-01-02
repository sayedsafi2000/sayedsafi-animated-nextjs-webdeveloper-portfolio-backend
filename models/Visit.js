import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  // Page information
  page: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true
  },
  
  // Visitor information (privacy-friendly)
  sessionId: {
    type: String,
    index: true
  },
  isUnique: {
    type: Boolean,
    default: false
  },
  
  // Device & Browser
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Referrer
  referrer: {
    type: String,
    default: 'direct'
  },
  referrerDomain: {
    type: String
  },
  
  // Geolocation (no raw IP stored)
  country: {
    type: String,
    index: true
  },
  countryCode: {
    type: String,
    index: true
  },
  city: {
    type: String
  },
  region: {
    type: String
  },
  
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Respect Do Not Track
  doNotTrack: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
visitSchema.index({ timestamp: -1 });
visitSchema.index({ page: 1, timestamp: -1 });
visitSchema.index({ country: 1, timestamp: -1 });
visitSchema.index({ sessionId: 1, timestamp: -1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;

