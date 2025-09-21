import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with longer timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.message === 'Network Error') {
      error.message = 'Network error. Please check if the server is running.';
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (updates) => api.put('/users/profile', updates),
};

// Trip API
export const tripService = {
  generateItinerary: (tripData) => {
    console.log('Sending to AI API:', tripData);
    return api.post('/ai/generate-itinerary', {
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: Number(tripData.budget),
      travelers: Number(tripData.travelers),
      interests: Array.isArray(tripData.interests) ? tripData.interests : []
    });
  },
  createTrip: (tripData) => api.post('/trips', tripData),
  getUserTrips: () => api.get('/trips'),
  getTrip: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, updates) => api.put(`/trips/${id}`, updates),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

// Destination API
export const destinationService = {
  getPopularDestinations: () => api.get('/destinations/popular'),
  searchDestinations: (query) => api.get(`/destinations/search?q=${query}`),
  getDestinationInfo: (id) => api.get(`/destinations/${id}`),
};

// Booking API
export const bookingService = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

export default api;