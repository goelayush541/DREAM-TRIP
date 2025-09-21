const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bestTimeToVisit: {
    from: String,
    to: String
  },
  attractions: [{
    name: String,
    description: String,
    category: String,
    cost: Number,
    bookingLink: String
  }],
  averageCost: {
    budget: Number,
    midRange: Number,
    luxury: Number
  },
  climate: {
    summer: String,
    winter: String
  },
  images: [String],
  popularity: {
    type: Number,
    default: 0
  },
  tags: [String],
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

// Index for search functionality
destinationSchema.index({ name: 'text', country: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);