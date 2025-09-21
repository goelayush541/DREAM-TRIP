const express = require('express');
const {
  createTrip,
  getUserTrips,
  getTrip,
  updateTrip,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip'); // Make sure to import Trip model

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUserTrips)    // GET /api/trips - Get all trips for the user
  .post(createTrip);    // POST /api/trips - Create a new trip

router.route('/:id')
  .get(getTrip)         // GET /api/trips/:id - Get a single trip
  .put(updateTrip)      // PUT /api/trips/:id - Update a trip
  .delete(deleteTrip);  // DELETE /api/trips/:id - Delete a trip

// Debug route to test trip access (separate from the /:id chain)
router.get('/debug/:id', async (req, res) => {
  try {
    console.log('Debug trip access:', {
      tripId: req.params.id,
      userId: req.user.id,
      userEmail: req.user.email
    });
    
    const trip = await Trip.findById(req.params.id).populate('user', 'username email');
    
    if (!trip) {
      console.log('Trip not found');
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;