import React, { useState, useEffect } from 'react';

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

function App() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className={`flex justify-between items-center transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Logo Section */}
            <div className={`flex items-center transition-all duration-500 ease-in-out ${isScrolled ? 'h-10' : 'h-14'}`}>
              {/* Magic Animated Logo wrapper */}
              <div className={`transition-all duration-500 ease-in-out origin-left overflow-hidden flex items-center ${isScrolled ? 'w-0 opacity-0 mr-0 scale-50' : 'w-14 opacity-100 mr-3 scale-100'}`}>
                <img src="/favicon.png" alt="Rail Samay Logo" className="h-14 w-14 object-contain flex-shrink-0" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={`font-montserrat font-extrabold text-[#1E3A8A] tracking-tight transition-all duration-500 ${isScrolled ? 'text-xl leading-none' : 'text-2xl leading-none'}`}>RAIL SAMAY</span>
                <span className={`font-medium tracking-widest uppercase text-slate-500 transition-all duration-500 ease-in-out ${isScrolled ? 'text-[0.55rem] mt-0.5' : 'text-[0.65rem] mt-1'}`}>The Accurate Time of Indian Railways</span>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <button className="text-slate-500 hover:text-[#1E3A8A] text-sm font-semibold transition-colors">A/अ</button>
              <div className="h-6 w-px bg-slate-200"></div>
              <button className="text-[#1E3A8A] font-semibold text-sm hover:underline">Passenger Login</button>
              <button className={`bg-[#1E3A8A] text-white rounded font-semibold text-sm shadow hover:bg-blue-900 transition-all duration-300 ease-in-out flex items-center ${isScrolled ? 'px-4 py-1.5' : 'px-5 py-2'}`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                ATS Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full relative h-[calc(100vh-80px)] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Indian Railways Vande Bharat" className="w-full h-full object-cover object-[80%_center]" />
          {/* Navy Blue Gradient Overlay - strictly left sided so train is visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/90 via-[#1E3A8A]/40 to-transparent w-full md:w-[70%] lg:w-[55%]"></div>
        </div>
        <div className="w-full px-4 sm:px-8 lg:px-12 relative z-10 flex items-center h-full">
          <div className="max-w-2xl text-white mt-16 lg:mt-28">
            <h1 className="text-4xl lg:text-6xl font-montserrat font-extrabold leading-[1.1] mb-6 text-white">
              <span className="block mb-2">India's Most Accurate</span>
              <span className="block">Train Tracker.</span>
            </h1>
            <p className="text-lg text-blue-50 mb-10 font-inter leading-relaxed max-w-xl opacity-95">
              Experience the next generation of railway tracking. Rail Samay uses advanced dynamic forecasting to provide you with the most accurate, real-time arrival predictions across the Indian Railways network.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="bg-white text-[#1E3A8A] font-bold py-4 px-8 rounded shadow hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider">
                Track Your Train
              </button>
              <button className="border-2 border-white text-white font-bold py-4 px-8 rounded hover:bg-white/10 transition-colors text-sm uppercase tracking-wider">
                Live Station Board
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
                <button className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max">
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
                <button className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max">
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
                <button className="text-[#F97316] font-bold text-sm uppercase tracking-wide flex items-center hover:text-orange-700 transition-colors mt-auto w-max">
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
              <div className="bg-[#F97316] text-white text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-full inline-block mb-6">For Railway Operators</div>
              <h3 className="text-4xl font-montserrat font-extrabold text-[#1E3A8A] mb-6 leading-tight">ATS Control Room Dashboard</h3>
              <p className="text-slate-600 font-inter text-lg leading-relaxed mb-8">
                The central nervous system for railway staff. Monitor live network traffic, predict cascading delays across zones, and manage train schedules with unprecedented precision from a unified command center.
              </p>
              <ul className="space-y-4 mb-10 text-slate-700 font-inter font-medium">
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#F97316] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Live Network Map & Grid View</li>
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#F97316] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Algorithmic Delay Prediction</li>
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#F97316] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Global Fleet Oversight</li>
              </ul>
              <button className="bg-[#1E3A8A] text-white font-bold py-4 px-10 rounded shadow hover:bg-blue-900 transition-colors uppercase tracking-widest text-sm flex items-center group w-max">
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
              <div className="bg-[#10B981] text-white text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-full inline-block mb-6">For Citizens</div>
              <h3 className="text-4xl font-montserrat font-extrabold text-[#1E3A8A] mb-6 leading-tight">Passenger Tracking Portal</h3>
              <p className="text-slate-600 font-inter text-lg leading-relaxed mb-8">
                A frictionless tracking experience for everyday citizens. Enter your train number to get real-time dynamic ETAs, access live station boards, and receive instant WhatsApp alerts without complex registrations.
              </p>
              <ul className="space-y-4 mb-10 text-slate-700 font-inter font-medium">
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#10B981] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Open Live Station Boards</li>
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#10B981] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Dynamic Map-Based Tracking</li>
                 <li className="flex items-center"><svg className="w-6 h-6 text-[#10B981] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> WhatsApp Schedule Alerts</li>
              </ul>
              <button className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] font-bold py-4 px-10 rounded shadow hover:bg-slate-50 transition-colors uppercase tracking-widest text-sm flex items-center group w-max">
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

    </div>
  );
}

export default App;
