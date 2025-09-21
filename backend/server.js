const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Load environment variables
dotenv.config();

// Enable clustering for better memory management (production only)
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  console.log(`Master ${process.pid} is running`);
  
  // Fork workers (limit to 4 for memory efficiency)
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart the worker
  });
} else {
  // Worker process code
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
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

  // Import routes
  const userRoutes = require('./routes/users');
  const tripRoutes = require('./routes/trips');
  const destinationRoutes = require('./routes/destinations');
  const bookingRoutes = require('./routes/bookings');
  const aiRoutes = require('./routes/ai');

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

  // Memory usage monitoring (optional - can be removed if not needed)
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

  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log(`Worker ${process.pid} shutting down gracefully`);
    server.close(() => {
      mongoose.connection.close();
      process.exit(0);
    });
  });
}