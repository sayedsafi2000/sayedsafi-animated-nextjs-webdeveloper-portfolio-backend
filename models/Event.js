import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    index: true
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  path: {
    type: String,
    required: true
  },
  
  // Optional metadata (flexible JSON)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Visitor context (privacy-friendly)
  sessionId: {
    type: String,
    index: true
  },
  country: {
    type: String,
    index: true
  },
  countryCode: {
    type: String
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
eventSchema.index({ eventName: 1, timestamp: -1 });
eventSchema.index({ page: 1, timestamp: -1 });
eventSchema.index({ timestamp: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;

