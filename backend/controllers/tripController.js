const Trip = require('../models/Trip');
const User = require('../models/User');
const { generateItinerary } = require('../services/geminiService');

// Validation function for trip duration
const validateTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }
  
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (daysDiff > 30) {
    throw new Error('Trip duration cannot exceed 30 days');
  }
  
  if (daysDiff < 1) {
    throw new Error('End date must be after start date');
  }
  
  return daysDiff;
};

// Create a new trip with AI itinerary
exports.createTrip = async (req, res, next) => {
  try {
    const { title, destination, startDate, endDate, budget, travelers, interests } = req.body;
    
    // Validate required fields
    if (!title || !destination || !startDate || !endDate || !budget || !travelers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate trip duration
    try {
      validateTripDuration(startDate, endDate);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    let itinerary = { days: [], totalCost: 0 };
    
    // Generate AI itinerary if we have the required data
    if (destination && startDate && endDate && budget && travelers) {
      try {
        itinerary = await generateItinerary(
          destination,
          startDate,
          endDate,
          Number(budget),
          Array.isArray(interests) ? interests : [],
          Number(travelers)
        );
      } catch (aiError) {
        console.error('AI itinerary generation failed:', aiError);
        // Continue with empty itinerary if AI fails
      }
    }

    const trip = new Trip({
      title,
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      travelers: Number(travelers),
      interests: Array.isArray(interests) ? interests : [],
      itinerary: itinerary.days,
      totalCost: itinerary.totalCost || 0,
      user: req.user.id
    });
    
    await trip.save();
    
    // Add trip to user's saved trips
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { savedTrips: trip._id } }
    );
    
    // Populate user data in response
    await trip.populate('user', 'username email');
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    next(error);
  }
};

// Get all trips for a user
exports.getUserTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'username email');
    
    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// Get a single trip
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'username email');
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Check if user owns the trip
    if (trip.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You can only view your own trips.' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid trip ID format' });
    }
    next(error);
  }
};

// Update a trip
exports.updateTrip = async (req, res, next) => {
  try {
    const { title, destination, startDate, endDate, budget, travelers, interests, itinerary } = req.body;
    
    // Validate trip duration if dates are being updated
    if (startDate && endDate) {
      try {
        validateTripDuration(startDate, endDate);
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }
    }
    
    let trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        destination, 
        startDate, 
        endDate, 
        budget, 
        travelers, 
        interests, 
        itinerary,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('user', 'username email');
    
    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// Delete a trip
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    
    // Remove trip from user's saved trips
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedTrips: req.params.id } }
    );
    
    res.json({ message: 'Trip removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Add debug endpoint to help troubleshoot
exports.debugTrip = async (req, res, next) => {
  try {
    console.log('Debug trip access:', {
      tripId: req.params.id,
      userId: req.user.id,
      userEmail: req.user.email
    });
    
    const trip = await Trip.findById(req.params.id).populate('user', 'username email');
    
    if (!trip) {
      console.log('Trip not found in database');
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    console.log('Trip found:', {
      tripId: trip._id,
      tripUser: trip.user._id,
      currentUser: req.user.id,
      match: trip.user._id.toString() === req.user.id
    });
    
    if (trip.user._id.toString() !== req.user.id) {
      console.log('Access denied - user mismatch');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Debug error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid trip ID format' });
    }
    res.status(500).json({ error: error.message });
  }
};