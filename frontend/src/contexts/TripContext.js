import React, { createContext, useContext, useState } from 'react';
import { tripService } from '../services/api';

const TripContext = createContext();

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateItinerary = async (tripData) => {
    setLoading(true);
    setError('');
    try {
      console.log('Generating itinerary with data:', tripData);
      const response = await tripService.generateItinerary(tripData);
      console.log('AI itinerary response:', response.data);
      
      const tripResponse = await tripService.createTrip({
        title: `${tripData.destination} Trip`,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budget: Number(tripData.budget),
        travelers: Number(tripData.travelers),
        interests: Array.isArray(tripData.interests) ? tripData.interests : [],
        itinerary: response.data.days || [],
        totalCost: response.data.totalCost || 0,
        status: 'planned'
      });
      
      setCurrentTrip(tripResponse.data);
      setTrips(prev => [tripResponse.data, ...prev]);
      return tripResponse.data;
    } catch (err) {
      console.error('Error in generateItinerary:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate itinerary';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tripService.getUserTrips();
      setTrips(response.data);
      return response.data;
    } catch (err) {
      console.error('Error in getUserTrips:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch trips';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrip = async (id, retryCount = 0) => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching trip with ID:', id);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid trip ID');
      }
      
      const response = await tripService.getTrip(id);
      console.log('Trip API response received');
      
      setCurrentTrip(response.data);
      return response.data;
    } catch (err) {
      // Retry logic for network errors
      if (retryCount < 3 && (err.code === 'ERR_NETWORK' || err.message.includes('Network Error'))) {
        console.log(`Retrying trip fetch (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return getTrip(id, retryCount + 1);
      }
      
      console.error('Detailed error in getTrip:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        code: err.code
      });
      
      let errorMessage = 'Failed to fetch trip. Please try again.';
      
      if (err.message.includes('Network Error') || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 5000.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Trip not found. It may have been deleted.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You can only view your own trips.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login again to view this trip.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message.includes('Invalid trip ID')) {
        errorMessage = 'Invalid trip ID. Please check the URL.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id, updates) => {
    setLoading(true);
    setError('');
    try {
      const response = await tripService.updateTrip(id, updates);
      setCurrentTrip(response.data);
      setTrips(prev => prev.map(trip => trip._id === id ? response.data : trip));
      return response.data;
    } catch (err) {
      console.error('Error in updateTrip:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update trip';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    setLoading(true);
    setError('');
    try {
      await tripService.deleteTrip(id);
      setTrips(prev => prev.filter(trip => trip._id !== id));
      if (currentTrip && currentTrip._id === id) {
        setCurrentTrip(null);
      }
    } catch (err) {
      console.error('Error in deleteTrip:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete trip';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    trips,
    currentTrip,
    loading,
    error,
    generateItinerary,
    getUserTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    clearError: () => setError('')
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export default TripContext;