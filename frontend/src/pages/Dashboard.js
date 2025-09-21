import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { trips, getUserTrips, loading } = useTrip();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    getUserTrips();
  }, [getUserTrips]);

  const upcomingTrips = trips.filter(trip => 
    new Date(trip.startDate) > new Date() && trip.status !== 'completed'
  );
  
  const pastTrips = trips.filter(trip => 
    new Date(trip.endDate) < new Date() || trip.status === 'completed'
  );
  
  const currentTrips = trips.filter(trip => 
    new Date(trip.startDate) <= new Date() && 
    new Date(trip.endDate) >= new Date() && 
    trip.status !== 'completed'
  );

  const displayedTrips = activeTab === 'upcoming' ? upcomingTrips : 
                        activeTab === 'current' ? currentTrips : pastTrips;

  if (loading) {
    return <div className="dashboard-loading">Loading your trips...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Manage your travel plans and discover new destinations</p>
        <Link to="/plan-trip" className="btn btn-primary">
          Plan New Trip
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{upcomingTrips.length}</h3>
          <p>Upcoming Trips</p>
        </div>
        <div className="stat-card">
          <h3>{currentTrips.length}</h3>
          <p>Current Trips</p>
        </div>
        <div className="stat-card">
          <h3>{pastTrips.length}</h3>
          <p>Past Trips</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Trips
        </button>
        <button 
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
        >
          Current Trips
        </button>
        <button 
          className={activeTab === 'past' ? 'active' : ''}
          onClick={() => setActiveTab('past')}
        >
          Past Trips
        </button>
      </div>

      <div className="trips-grid">
        {displayedTrips.length > 0 ? (
          displayedTrips.map(trip => (
            <div key={trip._id} className="trip-card">
              <div className="trip-card-header">
                <h3>{trip.title}</h3>
                <span className={`status ${trip.status}`}>{trip.status}</span>
              </div>
              <div className="trip-card-details">
                <p><strong>Destination:</strong> {trip.destination}</p>
                <p><strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                <p><strong>Budget:</strong> ${trip.budget}</p>
                <p><strong>Travelers:</strong> {trip.travelers}</p>
              </div>
              <div className="trip-card-actions">
                <Link to={`/trip/${trip._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-trips">
            <p>No {activeTab} trips found.</p>
            <Link to="/plan-trip" className="btn btn-primary">
              Plan Your First Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;