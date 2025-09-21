import React, { useState } from 'react';
import './ActivityCard.css';

const ActivityCard = ({ activity, dayIndex, activityIndex, tripId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleBook = () => {
    if (activity.bookingLink) {
      window.open(activity.bookingLink, '_blank');
    }
  };

  return (
    <div className={`activity-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="activity-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="activity-time">
          {formatTime(activity.time)}
        </div>
        <div className="activity-main">
          <h4>{activity.title}</h4>
          <p className="activity-location">{activity.location}</p>
        </div>
        <div className="activity-meta">
          <span className="activity-duration">{activity.duration}h</span>
          <span className="activity-cost">${activity.cost}</span>
          <span className="toggle-icon">{isExpanded ? '▼' : '►'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="activity-details">
          <div className="activity-description">
            <p>{activity.description}</p>
          </div>
          
          <div className="activity-tags">
            <span className={`activity-category ${activity.category}`}>
              {activity.category}
            </span>
          </div>
          
          <div className="activity-actions">
            {activity.bookingLink && (
              <button onClick={handleBook} className="btn btn-primary">
                Book Now
              </button>
            )}
            <button className="btn btn-outline">
              Add to Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;