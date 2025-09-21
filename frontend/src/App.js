import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TripPlanner from './pages/TripPlanner';
import TripDetails from './pages/TripDetails';
import Destinations from './pages/Destinations';

// Styles
import './App.css';

// Future flags for React Router v7
const future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router future={future}>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/plan-trip" element={<TripPlanner />} />
                <Route path="/trip/:id" element={<TripDetails />} />
                <Route path="/destinations" element={<Destinations />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;