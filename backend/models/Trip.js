const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  date: Date,
  activities: [{
    time: String,
    title: String,
    description: String,
    location: String,
    cost: Number,
    duration: Number, // in hours
    category: String,
    bookingLink: String
  }]
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  travelers: {
    type: Number,
    default: 1
  },
  interests: [String],
  itinerary: [daySchema],
  totalCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'in-progress', 'completed'],
    default: 'draft'
  },
  weatherForecast: [{
    date: Date,
    high: Number,
    low: Number,
    condition: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Trip', tripSchema);