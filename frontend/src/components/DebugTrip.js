import React from 'react';

const DebugTrip = ({ tripId }) => {
  return (
    <div style={{ 
      padding: '15px', 
      background: '#f8f9fa', 
      border: '1px solid #e9ecef', 
      borderRadius: '8px',
      marginTop: '20px',
      fontSize: '14px'
    }}>
      <h4>🛠️ Debug Information</h4>
      <p><strong>Trip ID:</strong> {tripId || 'No ID provided'}</p>
      <p><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</p>
      <p>
        <strong>Check:</strong> 
        <a 
          href={`http://localhost:5000/api/trips/${tripId}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ marginLeft: '10px' }}
        >
          Test API Directly
        </a>
      </p>
    </div>
  );
};

export default DebugTrip;