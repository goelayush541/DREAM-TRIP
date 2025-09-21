import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Plan Your Dream Trip with AI</h1>
          <p>Personalized itineraries tailored to your budget, interests, and real-time conditions</p>
          <div className="hero-buttons">
            <Link to="/plan-trip" className="btn btn-primary">Start Planning</Link>
            <Link to="/destinations" className="btn btn-secondary">Explore Destinations</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/travel-hero.png" alt="Travel the world" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Our AI Trip Planner?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Planning</h3>
              <p>Our advanced AI creates personalized itineraries based on your preferences and real-time data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Budget Optimization</h3>
              <p>Get the most out of your trip with cost-effective recommendations tailored to your budget</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌦️</div>
              <h3>Real-Time Conditions</h3>
              <p>Adapt your plans based on current weather, events, and local conditions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Seamless Booking</h3>
              <p>Book activities, accommodations, and transportation directly through our platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Tell Us Your Preferences</h3>
              <p>Share your destination, travel dates, budget, and interests</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Creates Your Itinerary</h3>
              <p>Our AI generates a personalized plan with activities and bookings</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Customize & Book</h3>
              <p>Refine your itinerary and book everything in one place</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Enjoy Your Trip</h3>
              <p>Receive real-time updates and recommendations during your journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>What Travelers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"This AI trip planner saved me hours of research and created the perfect itinerary for my Japan trip!"</p>
              <div className="testimonial-author">
                <img src="/images/user1.jpg" alt="User" />
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>Tokyo, Japan</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"The budget optimization feature helped me experience Bali without breaking the bank. Highly recommend!"</p>
              <div className="testimonial-author">
                <img src="/images/user2.jpg" alt="User" />
                <div>
                  <h4>Michael Chen</h4>
                  <p>Bali, Indonesia</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <p>"The real-time weather adjustments were a lifesaver during my European tour. The AI suggested perfect indoor alternatives!"</p>
              <div className="testimonial-author">
                <img src="/images/user3.jpg" alt="User" />
                <div>
                  <h4>Emma Rodriguez</h4>
                  <p>Paris, France</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Plan Your Dream Trip?</h2>
          <p>Join thousands of travelers who have discovered the joy of stress-free trip planning</p>
          <Link to="/register" className="btn btn-primary">Get Started Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;