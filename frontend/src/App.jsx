import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';


// Placeholder Dashboards for later
const AtsDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 font-sans">
    <h1 className="text-4xl font-bold font-montserrat text-[#1E3A8A] mb-4">ATS Central Command Node</h1>
    <p className="text-slate-500 font-inter max-w-lg text-center">Secure connection established. ETA Engine telemetry will be displayed here soon.</p>
  </div>
);

const PassengerDashboard = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 font-sans">
    <h1 className="text-4xl font-bold font-montserrat text-[#F97316] mb-4">Passenger ETA Portal</h1>
    <p className="text-slate-500 font-inter max-w-lg text-center">Enter your PNR to track dynamic cascade delays securely.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        
        {/* Secure Routes */}
        <Route path="/ats-dashboard" element={<AtsDashboard />} />
        <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

