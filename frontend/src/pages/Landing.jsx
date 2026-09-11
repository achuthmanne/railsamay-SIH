import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import LiveEcosystem from '../components/LiveEcosystem';
import TrainDoorModal from '../components/TrainDoorModal';
import AuthDoorModal from '../components/AuthDoorModal';

// Custom Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "", decimals = 0, colorClass, sizeClass = "text-5xl md:text-6xl" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); 
      
      setCount(end * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  const formattedNumber = Number(count.toFixed(decimals)).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <div className={`${sizeClass} font-montserrat font-extrabold mb-2 tracking-tight ${colorClass}`}>
      {formattedNumber}<span className="text-3xl ml-1">{suffix}</span>
    </div>
  );
};

function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [authModalType, setAuthModalType] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* Navigation Bar */}
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ease-in-out bg-white ${isScrolled ? 'border-b border-slate-200' : ''}`}>
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className={`flex justify-between items-center transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Logo Section */}
            <div className={`flex items-center transition-all duration-500 ease-in-out ${isScrolled ? 'h-10' : 'h-14'}`}>
              {/* Magic Animated Logo wrapper */}
              <div className={`transition-all duration-500 ease-in-out origin-left overflow-hidden flex items-center ${isScrolled ? 'w-0 opacity-0 mr-0 scale-50' : 'w-14 opacity-100 mr-3 scale-100'}`}>
                <img src="/favicon.png" alt="Rail Samay Logo" className="h-14 w-14 object-contain flex-shrink-0" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={`font-montserrat font-extrabold text-[#1E3A8A] tracking-tight transition-all duration-500 ${isScrolled ? 'text-xl leading-none' : 'text-2xl leading-none'}`}>
                  RAIL <span className="text-[#F97316]">SAMAY</span>
                </span>
                <span className={`font-medium tracking-widest uppercase text-slate-500 transition-all duration-500 ease-in-out ${isScrolled ? 'text-[0.55rem] mt-0.5' : 'text-[0.65rem] mt-1'}`}>The Accurate Time of Indian Railways</span>
              </div>
            </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setAuthModalType('passenger')} className={`bg-transparent border border-[#F97316] text-[#F97316] rounded font-semibold text-sm hover:bg-orange-50 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${isScrolled ? 'px-4 py-1.5' : 'px-5 py-2'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <span>Passenger Login</span>
                </button>
              <button onClick={() => setAuthModalType('ats')} className={`bg-[#1E3A8A] border border-transparent text-white rounded font-semibold text-sm shadow hover:bg-blue-900 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ${isScrolled ? 'px-4 py-1.5' : 'px-5 py-2'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span>ATS Portal</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full relative h-[calc(100vh-80px)] overflow-hidden">
        {/* Background Image - No Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Indian Railways WAG-12B" className="w-full h-full object-cover object-[80%_center]" />
        </div>
        
        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 flex items-center h-full">
          <div className="max-w-3xl mt-16 lg:mt-28">
            <h1 className="text-4xl lg:text-[4rem] font-montserrat font-extrabold leading-[1.15] mb-8 text-[#0f172a] uppercase tracking-tight drop-shadow-sm">
              <span className="block mb-3">National Train</span>
              <span className="block text-[#1E3A8A]">Tracking System</span>
            </h1>
            <p className="text-lg lg:text-xl font-inter mb-12 text-slate-800 max-w-2xl leading-[1.8] font-medium drop-shadow-sm">
              An advanced digital infrastructure for real-time fleet positioning, algorithmic delay forecasting, and centralized network oversight. Ensuring precision and transparency across all railway zones.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button onClick={() => setAuthModalType('passenger')} className="bg-[#F97316] text-white font-bold py-4 px-8 rounded-sm shadow-md hover:bg-orange-700 transition-colors uppercase tracking-widest text-sm flex items-center justify-center">
                Track Live Status
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button onClick={() => setAuthModalType('ats')} className="bg-white text-[#1E3A8A] font-bold py-4 px-8 rounded-sm shadow-md hover:shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-sm flex items-center justify-center">
                ATS Control Room
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Network Stats Banner */}
      <div className="bg-white py-24 relative z-20">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="text-3xl font-montserrat font-extrabold text-[#1E3A8A] uppercase tracking-wide">National Network Status</h2>
            <div className="w-20 h-1.5 bg-[#F97316] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Stat 1 - Left (Pushed Down, Static) */}
            <div className="text-center transform md:translate-y-8">
              <div className="text-5xl lg:text-6xl font-montserrat font-extrabold mb-2 tracking-tight text-[#F97316]">
                98.2<span className="text-3xl ml-1">%</span>
              </div>
              <div className="text-sm font-inter font-extrabold text-slate-800 uppercase tracking-wider mt-4">Prediction Accuracy</div>
            </div>

            {/* Stat 2 - Center (Lifted Up, Bigger, Animated) */}
            <div className="text-center transform md:-translate-y-4 md:scale-110">
              <AnimatedCounter end={1250} decimals={0} suffix="+" duration={2500} colorClass="text-[#1E3A8A]" sizeClass="text-6xl lg:text-7xl" />
              <div className="text-sm font-inter font-extrabold text-slate-800 uppercase tracking-wider mt-4">Trains Monitored Live</div>
            </div>

            {/* Stat 3 - Right (Pushed Down, Static) */}
            <div className="text-center transform md:translate-y-8">
              <div className="text-5xl lg:text-6xl font-montserrat font-extrabold mb-2 tracking-tight text-[#10B981]">
                45
              </div>
              <div className="text-sm font-inter font-extrabold text-slate-800 uppercase tracking-wider mt-4">Active Delays Mitigated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Intelligence Section - THE FEATURES GRID */}
      <div className="bg-white pt-24 pb-32 relative z-20">
        <div className="w-full px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl font-montserrat font-extrabold text-[#1E3A8A] uppercase tracking-wide">Core System Capabilities</h2>
            <div className="w-20 h-1.5 bg-[#F97316] mx-auto mt-4"></div>
            <p className="mt-6 text-slate-500 max-w-2xl mx-auto font-inter text-lg">
              Powered by advanced machine learning and real-time network data, Rail Samay redefines ETA forecasting for Indian Railways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: Real-Time Telemetry */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden group flex flex-col">
              {/* Edge-to-Edge Image Container */}
              <div className="aspect-[16/9] w-full overflow-hidden relative border-b border-slate-100">
                <img src="/telemetry.png" alt="Real-Time Telemetry" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-montserrat font-extrabold text-[#1E3A8A] mb-3">Real-Time Telemetry</h3>
                <p className="text-slate-600 font-inter text-sm leading-relaxed mb-8 flex-grow">
                  Continuous ingestion of live GPS coordinates and automated station clearance signals to monitor train locations with pinpoint accuracy across the network.
                </p>
                <button 
                  onClick={() => setActiveModal('telemetry')}
                  className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max"
                >
                  Explore Architecture 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>

            {/* Feature 2: Smart Alerting */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden group flex flex-col">
              {/* Edge-to-Edge Image Container */}
              <div className="aspect-[16/9] w-full overflow-hidden relative border-b border-slate-100">
                <img src="/alerts.png" alt="Smart Alerting" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-montserrat font-extrabold text-[#1E3A8A] mb-3">Smart Alerting</h3>
                <p className="text-slate-600 font-inter text-sm leading-relaxed mb-8 flex-grow">
                  Instant, targeted notifications delivered directly to control room dashboards and passenger devices, ensuring everyone stays ahead of schedule changes.
                </p>
                <button 
                  onClick={() => setActiveModal('alerts')}
                  className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max"
                >
                  Explore Notifications 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>

            {/* Feature 3: AI Delay Propagation */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden group flex flex-col">
              {/* Edge-to-Edge Image Container */}
              <div className="aspect-[16/9] w-full overflow-hidden relative border-b border-slate-100">
                <img src="/ai-delay.png" alt="AI Delay Propagation" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-montserrat font-extrabold text-[#1E3A8A] mb-3">AI Delay Propagation</h3>
                <p className="text-slate-600 font-inter text-sm leading-relaxed mb-8 flex-grow">
                  Advanced machine learning algorithms predict cascading delays across the network. If one train is late, the ETA for all subsequent trains is dynamically adjusted.
                </p>
                <button 
                  onClick={() => setActiveModal('algorithms')}
                  className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max"
                >
                  Explore Algorithms 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Dual Portal Section - Unified White Background with Mockup Layouts */}
      <div className="bg-white pt-8 pb-32 relative z-20 border-t border-slate-100">
        <div className="w-full px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto">
          
          <div className="text-center mb-24">
            <h2 className="text-3xl font-montserrat font-extrabold text-[#1E3A8A] uppercase tracking-wide">Purpose-Built Interfaces</h2>
            <div className="w-20 h-1.5 bg-[#F97316] mx-auto mt-4"></div>
            <p className="mt-6 text-slate-600 max-w-2xl mx-auto font-inter text-lg">
              Rail Samay provides specialized digital environments, ensuring both railway operators and citizens have the exact tools they need.
            </p>
          </div>

          {/* ATS Control Room - Left Text, Right Mockup */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="w-full lg:w-1/2">
              <div className="bg-[#1E3A8A] text-white text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-sm border-l-4 border-[#F97316] inline-block mb-6 shadow-sm">For Railway Operators</div>
              <h3 className="text-4xl font-montserrat font-extrabold text-[#0f172a] mb-6 leading-tight">ATS Control Room Dashboard</h3>
              <p className="text-slate-700 font-inter text-lg leading-relaxed mb-8">
                The central nervous system for railway staff. Monitor live network traffic, predict cascading delays across zones, and manage train schedules with unprecedented precision from a unified command center.
              </p>
              {/* Animated Official Location-Train Track */}
              <div className="relative mb-10 font-inter pl-16">
                 <style>{`
                   @keyframes trainRoute {
                     0%, 15% { top: -7px; }
                     35%, 65% { top: 61px; }
                     85%, 100% { top: 129px; }
                   }
                   @keyframes signalBlink {
                     0%, 15% { opacity: 1; transform: scale(1); }
                     16%, 34% { opacity: 0; transform: scale(0.5); }
                     35%, 65% { opacity: 1; transform: scale(1); }
                     66%, 84% { opacity: 0; transform: scale(0.5); }
                     85%, 100% { opacity: 1; transform: scale(1); }
                   }
                   .moving-train {
                     animation: trainRoute 8s ease-in-out infinite alternate;
                   }
                   .signal-blink {
                     animation: signalBlink 8s ease-in-out infinite alternate;
                   }
                 `}</style>
                 
                 {/* Extended Visual Track (Perfect Sleeper Symmetry) */}
                 <div className="absolute left-[10px] w-[12px] z-0" 
                      style={{
                        top: '-12px',
                        height: '204px',
                        borderLeft: '3px solid #64748b',
                        borderRight: '3px solid #64748b',
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 12px, #cbd5e1 12px, #cbd5e1 16px)'
                      }}>
                 </div>

                 {/* Official Location Pin with Broadcast Signals */}
                 <div className="absolute left-[-16px] w-[64px] h-14 z-20 moving-train flex justify-center">
                   
                   {/* Left Broadcast Signal */}
                   <svg className="absolute left-[-6px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                     <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                   </svg>

                   {/* Right Broadcast Signal */}
                   <svg className="absolute right-[-6px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                     <path d="M10 4 A10 10 0 0 1 10 20 M4 8 A5 5 0 0 1 4 16" />
                   </svg>

                   {/* Marker Body */}
                   <div className="relative w-12 h-14">
                     {/* Solid Blue Map Marker */}
                     <svg className="absolute inset-0 w-full h-full text-[#1E3A8A] drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                     </svg>
                     {/* White Train Icon Center */}
                     <svg className="absolute top-[10px] left-[13px] w-[22px] h-[22px] text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2.23v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                     </svg>
                   </div>
                 </div>

                 {/* The Station Points */}
                 <div className="space-y-10 relative z-10">
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">Live Network Map & Grid View</div>
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">Algorithmic Delay Prediction</div>
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">Global Fleet Oversight</div>
                 </div>
              </div>
              <button onClick={() => setAuthModalType('ats')} className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold py-4 px-10 rounded-sm shadow-sm hover:bg-slate-50 hover:shadow-md transition-all uppercase tracking-widest text-sm flex items-center group w-max">
                Access ATS Portal
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
            <div className="w-full lg:w-1/2">
              {/* ATS Mockup Image with Flat Browser Frame */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
                {/* Browser Header Dot Bar */}
                <div className="bg-slate-50 px-4 py-2.5 flex items-center border-b border-slate-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"></div>
                  </div>
                </div>
                {/* Mockup Image */}
                <img src="/ats-mockup.png" alt="ATS Web Dashboard" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>

          {/* Passenger Portal - Left Mockup, Right Text */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="bg-[#1E3A8A] text-white text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-sm border-l-4 border-[#F97316] inline-block mb-6 shadow-sm">For Citizens</div>
              <h3 className="text-4xl font-montserrat font-extrabold text-[#0f172a] mb-6 leading-tight">Passenger Tracking Portal</h3>
              <p className="text-slate-700 font-inter text-lg leading-relaxed mb-8">
                A frictionless tracking experience for everyday citizens. Enter your train number to get real-time dynamic ETAs, access live station boards, and receive instant WhatsApp alerts without complex registrations.
              </p>
              {/* Animated Official Location-Train Track */}
              <div className="relative mb-10 font-inter pl-16">
                 {/* Extended Visual Track (Perfect Sleeper Symmetry) */}
                 <div className="absolute left-[10px] w-[12px] z-0" 
                      style={{
                        top: '-12px',
                        height: '204px',
                        borderLeft: '3px solid #64748b',
                        borderRight: '3px solid #64748b',
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 12px, #cbd5e1 12px, #cbd5e1 16px)'
                      }}>
                 </div>

                 {/* Official Location Pin with Broadcast Signals */}
                 <div className="absolute left-[-16px] w-[64px] h-14 z-20 moving-train flex justify-center">
                   
                   {/* Left Broadcast Signal */}
                   <svg className="absolute left-[-6px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                     <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                   </svg>

                   {/* Right Broadcast Signal */}
                   <svg className="absolute right-[-6px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                     <path d="M10 4 A10 10 0 0 1 10 20 M4 8 A5 5 0 0 1 4 16" />
                   </svg>

                   {/* Marker Body */}
                   <div className="relative w-12 h-14">
                     {/* Solid Blue Map Marker */}
                     <svg className="absolute inset-0 w-full h-full text-[#1E3A8A] drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                     </svg>
                     {/* White Train Icon Center */}
                     <svg className="absolute top-[10px] left-[13px] w-[22px] h-[22px] text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2.23v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                     </svg>
                   </div>
                 </div>

                 {/* The Station Points */}
                 <div className="space-y-10 relative z-10">
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">Open Live Station Boards</div>
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">Dynamic Map-Based Tracking</div>
                   <div className="font-semibold text-slate-800 text-lg flex items-center h-7">WhatsApp Schedule Alerts</div>
                 </div>
              </div>
              <button onClick={() => setAuthModalType('ats')} className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold py-4 px-10 rounded-sm shadow-sm hover:bg-slate-50 hover:shadow-md transition-all uppercase tracking-widest text-sm flex items-center group w-max">
                Track Your Train
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center relative min-h-[500px] lg:min-h-[600px] items-center">
              {/* Left Background Phone */}
              <div className="absolute left-4 sm:left-16 lg:left-6 top-8 lg:top-12 w-[160px] sm:w-[200px] lg:w-[220px] z-10 opacity-40 transform -rotate-12 scale-90 hover:opacity-80 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 cursor-pointer">
                <img src="/passenger-search-mockup.png" alt="Passenger App Search Screen" className="w-full h-auto object-contain" />
              </div>
              
              {/* Right Background Phone */}
              <div className="absolute right-4 sm:right-16 lg:right-6 top-8 lg:top-12 w-[160px] sm:w-[200px] lg:w-[220px] z-10 opacity-40 transform rotate-12 scale-90 hover:opacity-80 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 cursor-pointer">
                <img src="/passenger-alerts-mockup.png" alt="Passenger App Alerts Screen" className="w-full h-auto object-contain" />
              </div>

              {/* Center Main Phone */}
              <div className="relative z-30 w-[200px] sm:w-[240px] lg:w-[280px] transform hover:scale-105 transition-transform duration-500">
                <img src="/passenger-mockup.png" alt="Passenger Mobile App Mockup" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Live AI Ecosystem Section */}
      <LiveEcosystem />

      {/* Official Footer */}
      <footer className="bg-[#0f172a] text-slate-400 py-12 font-inter border-t-4 border-[#F97316]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
            <div className="md:w-1/2">
              <div className="mb-4">
                <div className="text-white font-black text-2xl tracking-tight">RAIL <span className="text-[#F97316]">SAMAY</span></div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Advanced Algorithmic Delay Prediction & GPS Fleet Tracking System. 
                Developed as a Proof of Concept for the Smart India Hackathon.
              </p>
            </div>
            <div className="flex gap-16 md:gap-24 md:justify-end">
              <div>
                <h3 className="text-white font-semibold mb-4 tracking-wider text-sm uppercase">Portals</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">ATS Command Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Passenger Tracking</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Live Station Boards</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 tracking-wider text-sm uppercase">Resources</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>Ã‚Â© 2024 Rail Samay. A Smart India Hackathon Initiative.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Train Door Modal */}
      <AuthDoorModal isOpen={authModalType !== null} onClose={() => setAuthModalType(null)} type={authModalType} />
      <TrainDoorModal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'telemetry' ? 'Real-Time Telemetry Pipeline' : 
          activeModal === 'alerts' ? 'Smart Notification Matrix' :
          activeModal === 'algorithms' ? 'ETA Propagation Engine' : ''
        }
        content={
          <div className="space-y-8">
            {/* Dynamic Diagram for all 3 capabilities */}
            {activeModal && (
              <div className="w-full mb-8 flex justify-center">
                <img 
                  src={
                    activeModal === 'telemetry' ? "/telemetry-flow.jpg" : 
                    activeModal === 'alerts' ? "/alerts-flow.jpg" : 
                    "/algorithms-flow.jpg"
                  } 
                  alt={
                    activeModal === 'telemetry' ? "Real-Time Telemetry Pipeline Diagram" : 
                    activeModal === 'alerts' ? "Smart Alerting Blast Radius Diagram" : 
                    "AI Delay Propagation Engine Diagram"
                  } 
                  className="max-h-[400px] w-auto object-contain rounded-lg shadow-sm border border-slate-200" 
                />
              </div>
            )}
            
            <div className="bg-slate-50 p-6 border-l-4 border-[#1E3A8A] shadow-sm">
              <p className="text-slate-700 font-inter font-medium leading-relaxed">
                {activeModal === 'telemetry' && 'The Telemetry Ingestion Node bypasses legacy static timetables by establishing a direct sync with Real-Time Train Information System (RTIS) GPS devices on locomotives. We continuously capture dynamic speed fluctuations, section clearance signals, and unscheduled outer-signal halts. This raw telemetry is piped directly into our high-performance Python FastAPI backend, which cleanses and normalizes the data to establish the definitive ground truth for every active train in the national network.'}
                {activeModal === 'alerts' && 'Our Smart Notification Matrix completely eliminates passenger panic and "alert fatigue". When a delay incident occurs (e.g., an unscheduled halt on the tracks), our system dynamically maps the exact "blast radius". It identifies trailing trains on the SAME physical track block and marks them for ETA impact alerts. Meanwhile, parallel or opposite-direction trains are flagged as "Clear", ensuring those passengers are never disturbed by irrelevant delay notifications.'}
                {activeModal === 'algorithms' && 'Our ETA Engine goes far beyond simple delay addition; it is a full-scale Station Resource & Platform Planner. The algorithm calculates exact mathematical overlaps across all active schedules. If a delayed train clashes with an on-time train at a specific platform, the engine scans all alternative platforms, calculates safety clearance buffers (e.g., 15 mins), checks standby crew availability, and verifies cleaning slot feasibility. It then generates a "Smart Recommendation" for the ATS Controller to resolve the conflict instantly.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Card 1 */}
              <div className="border border-slate-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                  <svg className="w-6 h-6 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h4 className="text-[#1E3A8A] font-bold font-montserrat mb-2">
                  {activeModal === 'telemetry' ? 'Direct RTIS Sync' : activeModal === 'alerts' ? 'Blast-Radius Mapping' : 'Cascade Math Logic'}
                </h4>
                <p className="text-sm text-slate-500 font-inter">
                  {activeModal === 'telemetry' ? 'Bypasses manual NTES updates by fetching live GPS coordinate feeds directly from locomotives.' : 
                   activeModal === 'alerts' ? 'Intelligently isolates the exact physical track blocks affected by an unscheduled halt.' : 
                   'Uses Max(Start) < Min(End) interval math to detect true temporal overlaps between schedules.'}
                </p>
              </div>

              {/* Card 2 */}
              <div className="border border-slate-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100">
                  <svg className="w-6 h-6 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h4 className="text-[#1E3A8A] font-bold font-montserrat mb-2">
                  {activeModal === 'telemetry' ? 'Edge Validation' : activeModal === 'alerts' ? 'Targeted Dissemination' : 'Platform Scanner'}
                </h4>
                <p className="text-sm text-slate-500 font-inter">
                  {activeModal === 'telemetry' ? 'Automatically filters out GPS anomalies and false signals before passing data to the AI Engine.' : 
                   activeModal === 'alerts' ? 'Sends critical ETA alerts only to the smartphones of passengers directly impacted by the delay.' : 
                   'Scans all available station platforms instantly to find alternative routes with sufficient safety buffers.'}
                </p>
              </div>

              {/* Card 3 */}
              <div className="border border-slate-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 className="text-[#1E3A8A] font-bold font-montserrat mb-2">
                  {activeModal === 'telemetry' ? 'Sub-Second Latency' : activeModal === 'alerts' ? 'Multi-Channel Sync' : 'Resource Allocation'}
                </h4>
                <p className="text-sm text-slate-500 font-inter">
                  {activeModal === 'telemetry' ? 'FastAPI architecture ensures that the central command sees train movements in absolute real-time.' : 
                   activeModal === 'alerts' ? 'Ensures the ATS dashboard, mobile app, and station displays show perfectly synchronized ETA data.' : 
                   'Cross-checks crew shifts and cleaning slots to ensure the new platform assignment is operationally viable.'}
                </p>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

export default Landing;


