import React, { useState } from 'react';
import ActivityCard from './ActivityCard';
import './ItineraryView.css';

const ItineraryView = ({ itinerary, tripId }) => {
  const [expandedDay, setExpandedDay] = useState(0);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="itinerary-empty">
        <h3>No itinerary yet</h3>
        <p>Your AI-generated itinerary will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="itinerary-view">
      <div className="itinerary-header">
        <h2>Your Itinerary</h2>
        <p>{itinerary.length} days of amazing experiences</p>
      </div>

      <div className="itinerary-days">
        {itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="itinerary-day">
            <div 
              className="day-header"
              onClick={() => setExpandedDay(expandedDay === dayIndex ? -1 : dayIndex)}
            >
              <h3>
                Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString()}
              </h3>
              <span className="toggle-icon">
                {expandedDay === dayIndex ? '▼' : '►'}
              </span>
            </div>
            
            {expandedDay === dayIndex && (
              <div className="day-activities">
                {day.activities.map((activity, activityIndex) => (
                  <ActivityCard
                    key={activityIndex}
                    activity={activity}
                    dayIndex={dayIndex}
                    activityIndex={activityIndex}
                    tripId={tripId}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="itinerary-summary">
        <h3>Trip Summary</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Activities</span>
            <span className="stat-value">
              {itinerary.reduce((total, day) => total + day.activities.length, 0)}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Days</span>
            <span className="stat-value">{itinerary.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;