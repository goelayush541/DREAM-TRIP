const Booking = require('../models/Booking');

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    
    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('trip', 'title destination')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get a single booking
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trip', 'title destination');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// Update a booking
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Booking removed' });
  } catch (error) {
    next(error);
  }
};