const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  console.error('Please add GEMINI_API_KEY=your_api_key_here to your .env file');
} else {
  console.log('✅ Gemini API key found in environment variables');
}

let genAI = null;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

// Test the API connection with a simple prompt
async function testGeminiConnection() {
  if (!genAI) return false;
  
  try {
    // Try the current correct model names
    const modelNames = [
      'gemini-1.5-flash',  // Current recommended model
      'gemini-1.5-pro',    // Alternative model
      'gemini-pro',        // Legacy name (might work for some)
      'models/gemini-pro'  // Full path format
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`Testing connection with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        await result.response;
        console.log(`✅ Gemini API connection successful with model: ${modelName}`);
        return true;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        continue;
      }
    }
    
    console.log('❌ All model attempts failed');
    return false;
  } catch (error) {
    console.log('❌ Gemini API connection test failed:', error.message);
    return false;
  }
}

// Get the correct working model
async function getWorkingModel() {
  if (!genAI) return null;
  
  // Current correct model names (as of 2024)
  const modelNames = [
    'gemini-1.5-flash',  // Fast and cost-effective
    'gemini-1.5-pro',    // More capable but slower
    'gemini-pro',        // Legacy
    'models/gemini-pro'  // Full path
  ];

  for (const modelName of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Test with a very simple prompt
      const result = await model.generateContent("Hello");
      await result.response;
      console.log(`✅ Using model: ${modelName}`);
      return model;
    } catch (error) {
      console.log(`❌ Model ${modelName} unavailable: ${error.message}`);
      continue;
    }
  }
  
  return null;
}

// Generate itinerary using Gemini AI
exports.generateItinerary = async (destination, startDate, endDate, budget, interests, travelers) => {
  try {
    console.log('Generating itinerary with Gemini AI...');
    
    // Check if Gemini AI is configured
    if (!genAI) {
      console.log('Gemini AI not configured, using fallback itinerary');
      return createFallbackItinerary(destination, startDate, endDate, budget, interests, travelers);
    }

    // Validate inputs
    if (!destination || !startDate || !endDate || !budget || !travelers) {
      throw new Error('Missing required parameters');
    }

    // Get a working model
    const model = await getWorkingModel();
    
    if (!model) {
      console.log('No working model found, using fallback itinerary');
      return createFallbackItinerary(destination, startDate, endDate, budget, interests, travelers);
    }
    
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    const prompt = `
      Create a detailed travel itinerary for ${destination} from ${startDate} to ${endDate} 
      (${daysDiff} days) for ${travelers} traveler(s) with a total budget of $${budget}. 
      The traveler is interested in: ${interests.join(', ') || 'general sightseeing'}.
      
      Please provide the itinerary in valid JSON format with this exact structure:
      {
        "days": [
          {
            "date": "YYYY-MM-DD",
            "activities": [
              {
                "time": "HH:MM",
                "title": "Activity title",
                "description": "Detailed description",
                "location": "Specific location",
                "cost": 50,
                "duration": 2.5,
                "category": "sightseeing/food/adventure/cultural/shopping/relaxation",
                "bookingLink": ""
              }
            ]
          }
        ],
        "totalCost": 500
      }
      
      Important rules:
      1. Total cost must be within the $${budget} budget
      2. Include realistic activities based on the interests
      3. Include proper timing and logical flow for each day
      4. Include some free time and flexibility
      5. Provide realistic costs for activities
      6. Return ONLY valid JSON, no additional text
      
      Make the itinerary engaging and personalized!
    `;
    
    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response received');
    
    // Clean the response
    let cleanedText = text.trim();
    
    // Remove JSON code blocks if present
    if (cleanedText.includes('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (cleanedText.includes('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '').trim();
    }
    
    // Extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    try {
      const itinerary = JSON.parse(cleanedText);
      
      // Validate the itinerary structure
      if (!itinerary.days || !Array.isArray(itinerary.days)) {
        throw new Error('Invalid itinerary structure: missing days array');
      }
      
      // Calculate total cost if not provided or invalid
      if (!itinerary.totalCost || isNaN(itinerary.totalCost)) {
        itinerary.totalCost = itinerary.days.reduce((total, day) => {
          return total + (day.activities?.reduce((dayTotal, activity) => {
            return dayTotal + (activity.cost || 0);
          }, 0) || 0);
        }, 0);
      }
      
      console.log('✅ Successfully generated and parsed itinerary');
      return itinerary;
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      
      // Return a fallback itinerary if parsing fails
      return createFallbackItinerary(destination, startDate, endDate, budget, interests, travelers);
    }
    
  } catch (error) {
    console.error('Error in generateItinerary:', error.message);
    
    // Return a fallback itinerary if AI fails completely
    return createFallbackItinerary(destination, startDate, endDate, budget, interests, travelers);
  }
};

// Get real-time recommendations
exports.getRecommendations = async (destination, interests, currentConditions) => {
  try {
    console.log('Getting recommendations from Gemini AI...');
    
    // Check if Gemini AI is configured
    if (!genAI) {
      console.log('Gemini AI not configured, returning default recommendations');
      return getDefaultRecommendations(destination, interests, currentConditions);
    }

    const model = await getWorkingModel();
    
    if (!model) {
      return getDefaultRecommendations(destination, interests, currentConditions);
    }
    
    const prompt = `
      Provide 3 travel recommendations for ${destination} based on:
      - Interests: ${interests.join(', ')}
      - Current conditions: ${currentConditions.weather}, ${currentConditions.temperature}°C
      
      Return valid JSON array with: title, description, reason, estimatedCost, bookingLink
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    let cleanedText = text.trim();
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    try {
      const recommendations = JSON.parse(cleanedText);
      return recommendations.slice(0, 3); // Return max 3 recommendations
    } catch (parseError) {
      console.error('Failed to parse recommendations:', parseError);
      return getDefaultRecommendations(destination, interests, currentConditions);
    }
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return getDefaultRecommendations(destination, interests, currentConditions);
  }
};

// Helper function to create fallback itinerary
function createFallbackItinerary(destination, startDate, endDate, budget, interests, travelers) {
  console.log('Creating fallback itinerary');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  const itinerary = {
    days: [],
    totalCost: Math.min(budget * 0.6, 200 * daysDiff)
  };
  
  const activityTemplates = [
    {
      title: `Explore ${destination}`,
      description: `Discover the beautiful sights and attractions of ${destination}`,
      category: "sightseeing",
      costMultiplier: 0.2
    },
    {
      title: "Local Dining Experience",
      description: "Enjoy local cuisine at a traditional restaurant",
      category: "food",
      costMultiplier: 0.15
    },
    {
      title: "Cultural Visit",
      description: "Explore museums, galleries, or historical sites",
      category: "cultural",
      costMultiplier: 0.1
    },
    {
      title: "Shopping Experience",
      description: "Visit local markets and shopping districts",
      category: "shopping",
      costMultiplier: 0.15
    },
    {
      title: "Relaxation Time",
      description: "Leisure time to relax and enjoy your surroundings",
      category: "relaxation",
      costMultiplier: 0.05
    }
  ];
  
  for (let i = 0; i < daysDiff; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    const day = {
      date: currentDate.toISOString().split('T')[0],
      activities: []
    };
    
    // Add 2-3 activities per day
    const activitiesCount = Math.min(3, Math.max(2, Math.floor(daysDiff / 2)));
    
    for (let j = 0; j < activitiesCount; j++) {
      const template = activityTemplates[(i + j) % activityTemplates.length];
      day.activities.push({
        time: `${9 + j * 3}:00`,
        title: `${template.title} - Day ${i + 1}`,
        description: template.description,
        location: destination,
        cost: Math.min(budget * template.costMultiplier / daysDiff, 50),
        duration: 2.5,
        category: template.category,
        bookingLink: ""
      });
    }
    
    itinerary.days.push(day);
  }
  
  return itinerary;
}

// Helper function for default recommendations
function getDefaultRecommendations(destination, interests, currentConditions) {
  return [
    {
      title: "Visit Local Museums and Galleries",
      description: "Explore cultural and historical exhibits indoors",
      reason: "Great for indoor activities during various weather conditions",
      estimatedCost: 25,
      bookingLink: ""
    },
    {
      title: "Guided City Tour",
      description: "Discover the city with a knowledgeable local guide",
      reason: "Suitable for various weather conditions with flexible options",
      estimatedCost: 40,
      bookingLink: ""
    },
    {
      title: "Local Food Tasting Experience",
      description: "Sample authentic local cuisine at food markets or restaurants",
      reason: "Enjoyable in any weather, focuses on indoor experiences",
      estimatedCost: 35,
      bookingLink: ""
    }
  ];
}

// Test function to check API connectivity
exports.testConnection = testGeminiConnection;
exports.getWorkingModel = getWorkingModel;