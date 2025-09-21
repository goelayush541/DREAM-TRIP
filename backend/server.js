const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const userRoutes = require('./routes/users');
const tripRoutes = require('./routes/trips');
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const aiRoutes = require('./routes/ai');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection - with better error handling for production
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    // Don't crash the app in production
  });
} else {
  console.log('MongoDB URI not provided, running in limited mode');
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint (essential for Vercel)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DreamTrip AI Backend Server is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users',
      trips: '/api/trips',
      ai: '/api/ai',
      destinations: '/api/destinations',
      health: '/api/health'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Export the app for Vercel serverless functions
module.exports = app;

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Server shutting down gracefully');
    server.close(() => {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
}