import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import './TripPlanner.css';

const TripPlanner = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    interests: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { generateItinerary } = useTrip();

  const interestsOptions = [
    'Adventure', 'Beaches', 'Cultural', 'Food', 'Historical', 
    'Nature', 'Nightlife', 'Shopping', 'Relaxation', 'Wildlife'
  ];

  // Validation function for trip dates
  const validateTripDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return 'Please select both start and end dates';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
    
    if (start < today) {
      return 'Start date cannot be in the past';
    }
    
    if (end < start) {
      return 'End date must be after start date';
    }
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysDiff > 30) {
      return 'Trip duration cannot exceed 30 days';
    }
    
    if (daysDiff < 1) {
      return 'Trip must be at least 1 day';
    }
    
    return null;
  };

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors = {};
    
    if (step === 1 && !formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (step === 2) {
      const dateError = validateTripDates(formData.startDate, formData.endDate);
      if (dateError) {
        newErrors.dates = dateError;
      }
    }
    
    if (step === 3) {
      if (!formData.budget || formData.budget <= 0) {
        newErrors.budget = 'Budget must be a positive number';
      }
      if (!formData.travelers || formData.travelers < 1) {
        newErrors.travelers = 'Number of travelers must be at least 1';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateCurrentStep()) {
      alert('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Sending trip data to AI:', formData);
      const trip = await generateItinerary(formData);
      console.log('AI response received:', trip);
      navigate(`/trip/${trip._id}`);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    // Clear errors when going back
    setErrors({});
  };

  // Calculate trip duration for display
  const calculateTripDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const tripDuration = calculateTripDuration();

  return (
    <div className="trip-planner">
      <div className="container">
        <div className="planner-header">
          <h1>Plan Your Dream Trip</h1>
          <p>Let our AI create a personalized itinerary just for you</p>
        </div>

        <div className="planner-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Destination</p>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Dates</p>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Budget & Travelers</p>
          </div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
            <span>4</span>
            <p>Interests</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="planner-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Where do you want to go?</h2>
              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter city, country, or region"
                  required
                  className={errors.destination ? 'error' : ''}
                />
                {errors.destination && <span className="error-text">{errors.destination}</span>}
              </div>
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>When are you traveling?</h2>
              {tripDuration > 0 && (
                <div className="trip-duration">
                  <span>Trip Duration: {tripDuration} day{tripDuration !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              {errors.dates && <div className="error-message">{errors.dates}</div>}
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Budget and Travelers</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="budget">Total Budget (USD)</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Enter your total budget"
                    required
                    min="1"
                    className={errors.budget ? 'error' : ''}
                  />
                  {errors.budget && <span className="error-text">{errors.budget}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="travelers">Number of Travelers</label>
                  <input
                    type="number"
                    id="travelers"
                    name="travelers"
                    value={formData.travelers}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    required
                    className={errors.travelers ? 'error' : ''}
                  />
                  {errors.travelers && <span className="error-text">{errors.travelers}</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h2>What are your interests?</h2>
              <p>Select all that apply to help us personalize your experience</p>
              
              <div className="interests-grid">
                {interestsOptions.map(interest => (
                  <div 
                    key={interest} 
                    className={`interest-card ${formData.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
              
              {formData.interests.length > 0 && (
                <div className="selected-interests">
                  <h4>Selected Interests:</h4>
                  <div className="interests-list">
                    {formData.interests.map(interest => (
                      <span key={interest} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Generating Your Itinerary...
                    </>
                  ) : (
                    'Create My Itinerary'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TripPlanner;