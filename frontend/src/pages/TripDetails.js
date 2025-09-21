import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import ItineraryView from '../components/Trip/ItineraryView';
import './TripDetails.css';

// Simple debug component since the original DebugTrip is missing
const DebugTrip = ({ tripId }) => {
  return (
    <div className="debug-info" style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
      <h4>Debug Information</h4>
      <p><strong>Trip ID:</strong> {tripId}</p>
      <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Refresh Page
      </button>
    </div>
  );
};

const TripDetails = () => {
  const { id } = useParams();
  const { currentTrip, getTrip, updateTrip, loading, error } = useTrip();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      if (id && !hasFetched) {
        try {
          console.log('🔄 Starting to fetch trip:', id);
          setHasFetched(true);
          await getTrip(id);
          console.log('✅ Trip fetched successfully');
        } catch (err) {
          console.error('❌ Error fetching trip:', err);
        }
      }
    };

    fetchTrip();
  }, [id, getTrip, hasFetched]);

  useEffect(() => {
    if (currentTrip) {
      setEditData({
        title: currentTrip.title || '',
        destination: currentTrip.destination || '',
        budget: currentTrip.budget || 0,
        travelers: currentTrip.travelers || 1,
        interests: Array.isArray(currentTrip.interests) ? currentTrip.interests : []
      });
    }
  }, [currentTrip]);

  const handleSave = async () => {
    try {
      await updateTrip(id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const handleCancel = () => {
    if (currentTrip) {
      setEditData({
        title: currentTrip.title || '',
        destination: currentTrip.destination || '',
        budget: currentTrip.budget || 0,
        travelers: currentTrip.travelers || 1,
        interests: Array.isArray(currentTrip.interests) ? currentTrip.interests : []
      });
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setEditData(prev => {
      const currentInterests = Array.isArray(prev.interests) ? prev.interests : [];
      
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...currentInterests, interest]
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="trip-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading your trip details...</p>
        <DebugTrip tripId={id} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-details-error">
        <h2>Error Loading Trip</h2>
        <p>{error}</p>
        <DebugTrip tripId={id} />
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="trip-details-error">
        <h2>Trip Not Found</h2>
        <p>The trip you're looking for doesn't exist or you don't have permission to view it.</p>
        <DebugTrip tripId={id} />
      </div>
    );
  }

  return (
    <div className="trip-details">
      <div className="trip-header">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleChange}
            className="edit-title"
            placeholder="Trip title"
          />
        ) : (
          <h1>{currentTrip.title}</h1>
        )}
        
        <div className="trip-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn btn-primary">
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              Edit Trip
            </button>
          )}
        </div>
      </div>

      <div className="trip-meta">
        <div className="meta-item">
          <span className="meta-label">Destination:</span>
          {isEditing ? (
            <input
              type="text"
              name="destination"
              value={editData.destination}
              onChange={handleChange}
              className="edit-input"
              placeholder="Destination"
            />
          ) : (
            <span className="meta-value">{currentTrip.destination}</span>
          )}
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Dates:</span>
          <span className="meta-value">
            {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Budget:</span>
          {isEditing ? (
            <input
              type="number"
              name="budget"
              value={editData.budget}
              onChange={handleChange}
              className="edit-input"
              min="0"
            />
          ) : (
            <span className="meta-value">${currentTrip.budget}</span>
          )}
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Travelers:</span>
          {isEditing ? (
            <input
              type="number"
              name="travelers"
              value={editData.travelers}
              onChange={handleChange}
              className="edit-input"
              min="1"
            />
          ) : (
            <span className="meta-value">{currentTrip.travelers}</span>
          )}
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span className={`status ${currentTrip.status || 'planned'}`}>
            {currentTrip.status || 'planned'}
          </span>
        </div>
      </div>

      <div className="trip-tabs">
        <button 
          className={activeTab === 'itinerary' ? 'active' : ''}
          onClick={() => setActiveTab('itinerary')}
        >
          Itinerary
        </button>
        <button 
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Trip Details
        </button>
        <button 
          className={activeTab === 'weather' ? 'active' : ''}
          onClick={() => setActiveTab('weather')}
        >
          Weather
        </button>
      </div>

      <div className="trip-content">
        {activeTab === 'itinerary' && (
          <ItineraryView 
            itinerary={currentTrip.itinerary || []} 
            tripId={currentTrip._id}
          />
        )}
        
        {activeTab === 'details' && (
          <div className="trip-info">
            <div className="info-section">
              <h3>Interests</h3>
              {isEditing ? (
                <div className="interests-edit">
                  {['Adventure', 'Beaches', 'Cultural', 'Food', 'Historical', 'Nature', 'Nightlife', 'Shopping', 'Relaxation', 'Wildlife'].map(interest => (
                    <label key={interest} className="interest-checkbox">
                      <input
                        type="checkbox"
                        checked={Array.isArray(editData.interests) && editData.interests.includes(interest)}
                        onChange={() => handleInterestToggle(interest)}
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="interests-list">
                  {Array.isArray(currentTrip.interests) && currentTrip.interests.length > 0 ? (
                    currentTrip.interests.map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))
                  ) : (
                    <p>No interests specified</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="info-section">
              <h3>Total Cost</h3>
              <p className="total-cost">
                ${currentTrip.totalCost || 0} of ${currentTrip.budget} budget
              </p>
              <div className="budget-bar">
                <div 
                  className="budget-progress" 
                  style={{ 
                    width: `${Math.min(((currentTrip.totalCost || 0) / (currentTrip.budget || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'weather' && (
          <div className="weather-forecast">
            <h3>Weather Forecast</h3>
            {currentTrip.weatherForecast && currentTrip.weatherForecast.length > 0 ? (
              <div className="weather-grid">
                {currentTrip.weatherForecast.map((day, index) => (
                  <div key={index} className="weather-day">
                    <h4>{new Date(day.date).toLocaleDateString()}</h4>
                    <div className="weather-temp">
                      {day.high}° / {day.low}°
                    </div>
                    <div className="weather-condition">
                      {day.condition}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No weather data available. Weather information will be added closer to your trip dates.</p>
            )}
          </div>
        )}
      </div>

      {/* Debug component at the bottom */}
      <DebugTrip tripId={id} />
    </div>
  );
};

export default TripDetails;