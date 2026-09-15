import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ATSDashboard from './pages/ATSDashboard';
import TrainForecast from './pages/TrainForecast';
import PassengerTracking from './pages/PassengerTracking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Secure Routes */}
        <Route path="/ats-dashboard" element={<ATSDashboard />} />
        <Route path="/forecast/:trainNo" element={<TrainForecast />} />
        <Route path="/passenger-dashboard" element={<PassengerTracking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
