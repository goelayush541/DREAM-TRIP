const express = require('express');
const { generateItinerary, getRecommendations } = require('../services/geminiService');
const { protect } = require('../middleware/auth');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimit'); 
// Generate itinerary using Gemini AI
router.use(aiLimiter);
router.post('/generate-itinerary', protect, async (req, res) => {
  try {
    console.log('Received AI request:', req.body);
    
    const { destination, startDate, endDate, budget, interests, travelers } = req.body;
    
    // Validate required fields
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    if (!endDate) {
      return res.status(400).json({ error: 'End date is required' });
    }
    if (!budget) {
      return res.status(400).json({ error: 'Budget is required' });
    }
    if (!travelers) {
      return res.status(400).json({ error: 'Number of travelers is required' });
    }

    // Validate data types
    if (isNaN(budget) || budget <= 0) {
      return res.status(400).json({ error: 'Budget must be a positive number' });
    }

    if (isNaN(travelers) || travelers <= 0 || !Number.isInteger(Number(travelers))) {
      return res.status(400).json({ error: 'Number of travelers must be a positive integer' });
    }

    // Ensure interests is an array
    const interestsArray = Array.isArray(interests) ? interests : [];

    console.log('Processing itinerary for:', {
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      travelers: Number(travelers),
      interests: interestsArray
    });

    const itinerary = await generateItinerary(
      destination,
      startDate,
      endDate,
      Number(budget),
      interestsArray,
      Number(travelers)
    );

    res.json(itinerary);
    
  } catch (error) {
    console.error('Error in generate-itinerary route:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.message.includes('Missing required parameters')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Failed to parse')) {
      return res.status(500).json({ 
        error: 'Failed to process AI response. Please try again.' 
      });
    }

    if (error.message.includes('Gemini AI is not configured')) {
      return res.status(500).json({ 
        error: 'AI service is not configured. Please contact administrator.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate itinerary. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get real-time recommendations
router.post('/recommendations', protect, async (req, res) => {
  try {
    const { destination, interests, currentConditions } = req.body;
    
    if (!destination || !interests || !currentConditions) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination, interests, currentConditions' 
      });
    }

    const recommendations = await getRecommendations(
      destination,
      interests,
      currentConditions
    );

    res.json(recommendations);
    
  } catch (error) {
    console.error('Error in recommendations route:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint without AI (for debugging)
router.post('/generate-itinerary-test', protect, async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, interests, travelers } = req.body;
    
    // Validate required fields
    if (!destination || !startDate || !endDate || !budget || !travelers) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create a simple test itinerary
    const testItinerary = {
      days: [
        {
          date: startDate,
          activities: [
            {
              time: "09:00",
              title: `Explore ${destination}`,
              description: `Discover the beautiful city of ${destination}. Visit local landmarks and enjoy the scenery.`,
              location: destination,
              cost: Math.min(budget * 0.3, 100),
              duration: 4,
              category: "sightseeing",
              bookingLink: ""
            },
            {
              time: "14:00",
              title: "Local Cuisine Experience",
              description: "Enjoy authentic local food at a traditional restaurant",
              location: "City Center",
              cost: Math.min(budget * 0.2, 50),
              duration: 2,
              category: "food",
              bookingLink: ""
            },
            {
              time: "19:00",
              title: "Evening Relaxation",
              description: "Free time to relax and explore at your own pace",
              location: "Your accommodation",
              cost: 0,
              duration: 3,
              category: "relaxation",
              bookingLink: ""
            }
          ]
        }
      ],
      totalCost: Math.min(budget * 0.5, 150)
    };

    // Add more days if the trip is longer
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      for (let i = 1; i < daysDiff; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + i);
        
        testItinerary.days.push({
          date: nextDate.toISOString().split('T')[0],
          activities: [
            {
              time: "10:00",
              title: `Day ${i + 1} Adventure`,
              description: `Continue exploring ${destination} and its surroundings`,
              location: destination,
              cost: Math.min(budget * 0.2 / daysDiff, 40),
              duration: 5,
              category: "adventure",
              bookingLink: ""
            }
          ]
        });
      }
    }
    
    console.log('Generated test itinerary:', testItinerary);
    res.json(testItinerary);
    
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add this to your existing ai.js routes
router.get('/test-connection', async (req, res) => {
  try {
    const { testConnection, getWorkingModel } = require('../services/geminiService');
    
    console.log('Testing Gemini API connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'Gemini API connection successful',
        model: 'Connection test passed' 
      });
    } else {
      // Try to get a working model directly
      const model = await getWorkingModel();
      if (model) {
        res.json({ 
          success: true, 
          message: 'Gemini API connection successful with direct model test',
          model: 'Model connection passed'
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Gemini API connection failed. Please check your API key and model availability.',
          note: 'The app will use fallback itineraries instead of AI generation.'
        });
      }
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Connection test error: ' + error.message 
    });
  }
});

// Add model list endpoint to see what's available
router.get('/model-info', async (req, res) => {
  try {
    res.json({
      availableModels: [
        'gemini-1.5-flash (Recommended)',
        'gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-pro (Legacy)',
        'models/gemini-pro (Full path)'
      ],
      note: 'Google frequently updates model names. Check https://ai.google.dev/models for current models.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;