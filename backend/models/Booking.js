const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  type: {
    type: String,
    enum: ['flight', 'hotel', 'activity', 'transport', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: Date,
  time: String,
  location: String,
  cost: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  bookingReference: String,
  provider: String,
  cancellationPolicy: String,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);