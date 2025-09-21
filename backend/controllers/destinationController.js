const Destination = require('../models/Destination');

// Get all destinations with optional filtering
exports.getDestinations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, country, tag } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by country
    if (country) {
      query.country = new RegExp(country, 'i');
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { popularity: -1, createdAt: -1 }
    };
    
    const destinations = await Destination.find(query)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort);
    
    const total = await Destination.countDocuments(query);
    
    res.json({
      destinations,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get a single destination by ID
exports.getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    // Increment popularity
    destination.popularity += 1;
    await destination.save();
    
    res.json(destination);
  } catch (error) {
    next(error);
  }
};

// Get popular destinations
exports.getPopularDestinations = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    
    const destinations = await Destination.find()
      .sort({ popularity: -1 })
      .limit(parseInt(limit));
    
    res.json(destinations);
  } catch (error) {
    next(error);
  }
};

// Search destinations
exports.searchDestinations = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const destinations = await Destination.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    res.json(destinations);
  } catch (error) {
    next(error);
  }
};