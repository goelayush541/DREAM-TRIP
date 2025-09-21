const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

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
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trip-planner';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Memory usage monitoring (optional - for development)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:');
    console.log(`- RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`);
    console.log(`- Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
    console.log(`- Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  }, 30000);
}

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// For Vercel deployment
module.exports = app;

// For local development
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Server shutting down gracefully');
    server.close(() => {
      mongoose.connection.close();
      process.exit(0);
    });
  });
}