import React, { useState, useEffect } from 'react';
import { destinationService } from '../services/api';
import './Destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [countries, setCountries] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationService.getPopularDestinations();
      setDestinations(response.data);
      
      // Extract unique countries and tags
      const uniqueCountries = [...new Set(response.data.map(d => d.country))];
      const allTags = response.data.flatMap(d => d.tags);
      const uniqueTags = [...new Set(allTags)];
      
      setCountries(uniqueCountries);
      setTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await destinationService.searchDestinations(searchTerm);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error searching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(destination => {
    return (
      (selectedCountry ? destination.country === selectedCountry : true) &&
      (selectedTag ? destination.tags.includes(selectedTag) : true)
    );
  });

  if (loading) {
    return (
      <div className="destinations-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing destinations...</p>
      </div>
    );
  }

  return (
    <div className="destinations">
      <div className="destinations-header">
        <h1>Explore Destinations</h1>
        <p>Discover amazing places around the world for your next adventure</p>
      </div>

      <div className="destinations-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-controls">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <button onClick={() => {
            setSelectedCountry('');
            setSelectedTag('');
            setSearchTerm('');
            fetchDestinations();
          }}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="destinations-grid">
        {filteredDestinations.map(destination => (
          <div key={destination._id} className="destination-card">
            <div className="destination-image">
              {destination.images && destination.images.length > 0 ? (
                <img src={destination.images[0]} alt={destination.name} />
              ) : (
                <div className="destination-placeholder">
                  <span>🌎</span>
                </div>
              )}
              <div className="destination-overlay">
                <span className="destination-country">{destination.country}</span>
              </div>
            </div>
            
            <div className="destination-content">
              <h3>{destination.name}</h3>
              <p className="destination-description">
                {destination.description.length > 100 
                  ? `${destination.description.substring(0, 100)}...` 
                  : destination.description
                }
              </p>
              
              <div className="destination-details">
                <div className="detail-item">
                  <span>🏷️</span>
                  <div className="tags">
                    {destination.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                
                <div className="detail-item">
                  <span>💰</span>
                  <span>Budget: ${destination.averageCost?.budget || 'N/A'}</span>
                </div>
                
                <div className="detail-item">
                  <span>⭐</span>
                  <span>Popularity: {destination.popularity}</span>
                </div>
              </div>
              
              <button className="btn btn-primary">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <div className="no-destinations">
          <h3>No destinations found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default Destinations;