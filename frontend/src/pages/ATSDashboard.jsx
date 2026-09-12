import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimulationEngine } from '../services/SimulationEngine';
import LiveNetworkMap from '../components/LiveNetworkMap';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const delayData = [
  { time: 'Now', actual: 20, predicted: 10 },
  { time: '1h', actual: 35, predicted: 15 },
  { time: '2h', actual: 40, predicted: 20 },
  { time: '3h', actual: 55, predicted: 25 },
  { time: '4h', actual: 45, predicted: 15 },
  { time: '5h', actual: 70, predicted: 35 },
  { time: '6h', actual: 55, predicted: 35 },
];

const COLORS = { green: '#10B981', orange: '#F97316', red: '#EF4444', blue: '#3b82f6', gray: '#f1f5f9' };

const CustomDonut = ({ percentage, color, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[{ value: percentage }, { value: 100 - percentage }]}
            cx="50%" cy="50%" innerRadius={25} outerRadius={35}
            startAngle={90} endAngle={-270}
            dataKey="value" stroke="none"
          >
            <Cell fill={color} />
            <Cell fill={COLORS.gray} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 text-sm">
        {percentage}%
      </div>
    </div>
    <div className="text-center mt-2">
      <div className="text-[10px] font-semibold text-slate-500 leading-tight w-16">{label}</div>
    </div>
  </div>
);

const ATSDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveTrains, setLiveTrains] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [viewMode, setViewMode] = useState('Division');
  const [isLoading, setIsLoading] = useState(true);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const zone = localStorage.getItem('rail_samay_zone') || 'Central Railway';
  const division = localStorage.getItem('rail_samay_division') || 'Nagpur';
  const office = localStorage.getItem('rail_samay_office') || 'Control Room';

  useEffect(() => {
    const engine = new SimulationEngine(division);
    engine.initialize().then(data => {
      setLiveTrains(data);
      setIsLoading(false);
    });
  }, [division]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTrains = liveTrains.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.no.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.currentLocation.toLowerCase().includes(q) ||
      t.source.toLowerCase().includes(q) ||
      t.dest.toLowerCase().includes(q)
    );
  });

  const getNetworkState = () => {
    if (!liveTrains || liveTrains.length === 0) return { text: 'NORMAL', color: 'text-emerald-600', border: 'border-l-emerald-500', icon: 'text-emerald-600' };
    
    const hasConflict = liveTrains.some(t => t.scenarioFlags && t.scenarioFlags.length > 0);
    if (hasConflict) return { text: 'CRITICAL', color: 'text-red-600', border: 'border-l-red-600', icon: 'text-red-600' };
    
    const maxDelay = Math.max(...liveTrains.map(t => t.delayMinutes || 0), 0);
    if (maxDelay >= 15) return { text: 'ELEVATED', color: 'text-orange-600', border: 'border-l-orange-500', icon: 'text-orange-500' };
    if (maxDelay >= 3) return { text: 'WARNING', color: 'text-yellow-500', border: 'border-l-yellow-400', icon: 'text-yellow-500' };
    
    return { text: 'NORMAL', color: 'text-emerald-600', border: 'border-l-emerald-500', icon: 'text-emerald-600' };
  };
  
  const netState = getNetworkState();

  return (
    <div className="h-screen flex bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR - PURE GOVT ENTERPRISE STYLE */}
      <div className="w-[260px] bg-[#1E3A8A] flex flex-col border-r border-slate-300 relative z-20">
        
        {/* Official Logo Header */}
        <div className="bg-white p-6 flex flex-col items-center justify-center border-b-4 border-orange-500 space-y-3 shadow-sm relative z-30">
          <img src="/favicon.png" alt="Rail Samay" className="w-14 h-14 drop-shadow-sm" />
          <div className="text-center">
            <h1 className="font-black font-montserrat text-2xl tracking-tight text-[#1E3A8A] leading-none m-0">RAIL <span className="text-[#F97316]">SAMAY</span></h1>
            <div className="text-[10px] font-bold text-slate-500 font-inter uppercase mt-1 tracking-widest">Control Center</div>
          </div>
        </div>

        {/* Navigation - Solid Flat Colors, No Transparency */}
        <nav className="flex-1 py-6 space-y-2">
          
          {/* Dashboard (Active) - Solid White with Blue Text */}
          <button className="w-full flex items-center space-x-3 bg-white text-[#1E3A8A] px-5 py-4 border-l-4 border-orange-500 shadow-sm">
            <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="font-bold text-sm font-inter">Live Dashboard</span>
          </button>
          
          {/* Inactive Tabs - Solid Blue, White Text */}
          <button className="w-full flex items-center space-x-3 bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-4 border-l-4 border-transparent transition-none">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="font-semibold text-sm flex-1 text-left font-inter">Routing Map</span>
          </button>

          <button className="w-full flex items-center space-x-3 bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-4 border-l-4 border-transparent transition-none">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
            <span className="font-semibold text-sm flex-1 text-left font-inter">Delay Analytics</span>
          </button>

          <button className="w-full flex items-center space-x-3 bg-[#1E3A8A] hover:bg-blue-900 text-white px-5 py-4 border-l-4 border-transparent transition-none">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span className="font-semibold text-sm flex-1 text-left font-inter">Conflict Alerts</span>
            <span className="w-6 h-5 bg-red-600 text-white rounded-sm text-[11px] font-bold flex items-center justify-center">2</span>
          </button>
        </nav>

        {/* Vector Image */}
        <div className="mt-auto pt-4 flex items-end justify-center overflow-hidden pointer-events-none">
           <img src="/sidebar-train-vector.png" alt="Rail Samay Express" className="w-[110%] h-auto object-contain translate-x-2 drop-shadow-xl" />
        </div>

        
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-slate-800 font-montserrat">Automatic Train Supervision</h1>
            <div className="text-xs font-medium text-slate-500 font-inter mt-0.5">{zone} • {division} Division</div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search train, station or route..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-sm text-sm w-64 focus:outline-none focus:bg-white focus:border-[#1E3A8A] transition-colors text-slate-800 font-semibold placeholder:font-normal placeholder:text-slate-400" />
            </div>
            
            {/* Notifications */}
            <button className="relative text-slate-600 hover:text-slate-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {liveTrains.filter(t => t.scenarioFlags && t.scenarioFlags.includes('CONFLICT_SOURCE')).length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm leading-none flex items-center justify-center">
                    {liveTrains.filter(t => t.scenarioFlags && t.scenarioFlags.includes('CONFLICT_SOURCE')).length}
                  </span>
                )}
              </button>
            
            {/* Profile */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="w-9 h-9 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                ATS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{office}</span>
                <span className="text-[10px] font-bold text-green-600 flex items-center">Session Active</span>
              </div>
            </div>

              {/* Terminate Session */}
              <div className="border-l border-slate-200 pl-6">
                <button onClick={() => navigate('/')} className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 transition-colors rounded-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
        </header>

        {/* DASHBOARD CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          
          {/* Top Info Bar (Map Controls & Time) */}
          <div className="flex justify-between items-center mb-4">
            
            {/* Map View Toggles */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setViewMode('Division')} 
                className={`text-[11px] font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider shadow-sm border ${viewMode === 'Division' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
              >
                Division View
              </button>
              <button 
                onClick={() => setViewMode('Zone')} 
                className={`text-[11px] font-bold px-6 py-2.5 rounded-sm transition-colors uppercase tracking-wider shadow-sm border ${viewMode === 'Zone' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
              >
                Zone View
              </button>
            </div>

            {/* Date & Time Sharp Display */}
            <div className="flex items-center space-x-4">
              <div className="bg-white border border-slate-300 border-l-4 border-l-[#F97316] shadow-sm rounded-sm px-4 py-2 flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest">
                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'})}
              </div>
              <div className="bg-white border border-slate-300 border-l-4 border-l-[#1E3A8A] shadow-sm rounded-sm px-4 py-2 flex items-center text-xs font-bold text-slate-700 uppercase tracking-widest tabular-nums">
                <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
            
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            
            {/* LEFT: MAP (Spans 2 columns) */}
            <div className="xl:col-span-2 bg-white rounded-sm border border-slate-300 flex flex-col relative overflow-hidden min-h-[400px]">
              
              {/* Real-time Dynamic Map */}
              <div className="flex-1 bg-slate-50 relative border-b border-slate-200 z-0">
                <LiveNetworkMap trains={filteredTrains} division={division} viewMode={viewMode} />
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 z-[500] bg-white rounded-sm p-3 border border-slate-200 shadow-sm text-xs font-bold space-y-2">
                <div className="flex items-center">
                  <svg width="12" height="17" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M12 0C5.373 0 0 5.373 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.373 18.627 0 12 0Z" fill="#10B981"/>
                    <circle cx="12" cy="12" r="5" fill="white"/>
                  </svg>
                  On Time
                </div>
                <div className="flex items-center">
                  <svg width="12" height="17" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 animate-pulse">
                    <path d="M12 0C5.373 0 0 5.373 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.373 18.627 0 12 0Z" fill="#EF4444"/>
                    <circle cx="12" cy="12" r="5" fill="white"/>
                  </svg>
                  Delayed / Conflict
                </div>
              </div>
            </div>

            {/* RIGHT: CHARTS & STATS */}
              <div className="flex flex-col space-y-6 h-[580px]">
              
              {/* AI Simulation Command Center (For Hackathon Demo) */}
                <div className="flex flex-col shadow-sm rounded-sm overflow-hidden">
                  <div className="bg-[#1E3A8A] px-4 py-3 border border-[#1E3A8A]">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                      Rail Samay Engine
                    </h3>
                  </div>
                  <div className="bg-white p-5 border border-slate-300 border-t-0 h-[220px] overflow-y-auto custom-scrollbar">
                    <div className="mb-5 border-b border-slate-100 pb-4">
                      
                      <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wide mb-1">Scenario 1: NGP Conflict</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Tests AI detection when <span className="font-bold text-slate-800">12626 Kerala Exp</span> incurs a +120m delay, causing a simultaneous arrival convergence with the on-time <span className="font-bold text-slate-800">12621 TN Exp</span> at Nagpur Junction.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                              setIsSimulating(true);
                            // The Dramatic Hackathon Pitch Sequence
                            
                            // Step 1: Initial State (TN Express is 10m delayed, Kerala is On Time)
                            setLiveTrains(prev => prev.map(t => {
                              if (t.no === '12621') return { ...t, delayMinutes: 10, delayStr: '+ 10m', status: 'Delayed', currentLocation: 'Passing CD (Chandrapur)' };
                              if (t.no === '12626') return { ...t, delayMinutes: 0, delayStr: 'On Time', status: 'On Time', currentLocation: 'Departing ET (Itarsi)' };
                              return t;
                            }));

                            // Step 2: Kerala gets a 60m delay mid-journey
                            setTimeout(() => {
                              setLiveTrains(prev => prev.map(t => {
                                if (t.no === '12626') return { ...t, delayMinutes: 60, delayStr: '+ 60m', status: 'Severely Delayed', currentLocation: 'Near Betul (BZU)' };
                                return t;
                              }));
                            }, 3500);

                            // Step 3: TN Express recovers its delay! Kerala delay worsens to 120m.
                            setTimeout(() => {
                              setLiveTrains(prev => prev.map(t => {
                                if (t.no === '12626') return { ...t, delayMinutes: 120, delayStr: '+ 120m', status: 'Severely Delayed', currentLocation: 'Passing PAR (Pandhurna)' };
                                if (t.no === '12621') return { ...t, delayMinutes: 0, delayStr: 'On Time', status: 'Delay Covered', currentLocation: 'Approaching SEGM' };
                                return t;
                              }));
                            }, 7500);

                            // Step 3.5: TN Express status settles back to "On Time"
                            setTimeout(() => {
                              setLiveTrains(prev => prev.map(t => {
                                if (t.no === '12621') return { ...t, status: 'On Time' };
                                return t;
                              }));
                            }, 9500);

                            // Step 4: Both approaching NGP. AI Predicts the collision and fires Red Alerts!
                            setTimeout(() => {
                              setLiveTrains(prev => prev.map(t => {
                                if (t.no === '12626') return { ...t, currentLocation: 'Approaching NGP', scenarioFlags: ['CONFLICT_SOURCE'] };
                                if (t.no === '12621') return { ...t, currentLocation: 'Approaching NGP', scenarioFlags: ['CONFLICT_TARGET'] };
                                return t;
                                }));
                                setIsSimulating(false);
                              }, 11500);
                          }}
                        disabled={isSimulating}
                          className={`w-full font-black text-[11px] uppercase tracking-widest py-3 rounded-sm border transition-colors shadow-sm ${isSimulating ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#F97316] hover:bg-[#EA580C] text-white border-[#EA580C]'}`}
                        >
                          {isSimulating ? 'Running Simulation...' : 'Trigger Scenario 1 (NGP)'}
                      </button>
                      <button 
                        onClick={() => {
                          const engine = new SimulationEngine(division);
                          engine.initialize().then(setLiveTrains);
                          setIsSimulating(false);
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-widest py-3 rounded-sm border border-slate-300 transition-colors shadow-sm"
                      >
                        Reset Baseline Timeline
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Conflict Output / Alert Logs */}
                <div className="flex flex-col shadow-sm rounded-sm overflow-hidden flex-1">
                  <div className="bg-slate-800 px-4 py-3 border border-slate-800">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                      Live Conflict Logs
                    </h3>
                  </div>
                  
                  <div className="bg-white p-5 border border-slate-300 border-t-0 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {liveTrains.some(t => t.scenarioFlags.includes('CONFLICT_SOURCE')) ? (
                      <div className="bg-white border-y border-r border-slate-200 border-l-4 border-l-red-600 shadow-sm flex flex-col p-4 rounded-none hover:bg-slate-50 transition-colors">
                              <div className="flex items-center mb-1.5">
                                <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 animate-pulse mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h3 className="text-[13px] font-bold text-slate-800 leading-none">Critical Operational Conflict</h3>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 ml-6 mb-4">
                                Platform 2 Occupancy Conflict — NGP
                              </p>
                              
                              <button 
                                onClick={() => setIsConflictModalOpen(true)}
                                className="w-full bg-red-600 text-white text-xs font-bold py-2.5 rounded-none shadow-sm hover:bg-red-700 transition-colors flex items-center justify-center uppercase tracking-widest">
                                View Conflict Details
                                <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                              </button>
                            </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 py-10">
                        <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Network Clear. No conflicts.</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          {/* SHARP GOVT REAL-TIME STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            
            {/* Active Trains -> Monitored Trains */}
            <div className="bg-white rounded-sm border border-slate-300 border-l-4 border-l-[#1E3A8A] shadow-sm p-4 flex flex-col relative">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monitored Trains</div>
                <svg className="w-4 h-4 text-[#1E3A8A] opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-2xl font-black text-slate-800 leading-none">{isLoading ? '...' : liveTrains.length}</div>
                <div className="text-[9px] font-bold text-[#1E3A8A] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">Active</div>
              </div>
            </div>

            {/* Progressive Network Threat Level */}
            <div className={`bg-white rounded-sm border border-slate-300 border-l-4 ${netState.border} shadow-sm p-4 flex flex-col relative transition-colors duration-500`}>
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Alert State</div>
                <svg className={`w-4 h-4 opacity-80 ${netState.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`text-xl font-black leading-none uppercase tracking-wide ${netState.color}`}>
                  {isLoading ? '...' : netState.text}
                </div>
              </div>
            </div>

            {/* Delayed Trains -> Pending Conflicts */}
            <div className="bg-white rounded-sm border border-slate-300 border-l-4 border-l-orange-500 shadow-sm p-4 flex flex-col relative">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delayed / Hold</div>
                <svg className="w-4 h-4 text-orange-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-2xl font-black text-slate-800 leading-none">{isLoading ? '...' : liveTrains.filter(t => t.status !== 'On Time').length}</div>
                <div className="text-[9px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-200">Trains</div>
              </div>
            </div>

            {/* AI Interventions -> AI Auto-Resolutions */}
            <div className="bg-white rounded-sm border border-slate-300 border-l-4 border-l-red-600 shadow-sm p-4 flex flex-col relative">
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Auto-Resolutions</div>
                <svg className="w-4 h-4 text-red-600 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-2xl font-black text-red-600 leading-none">{isLoading ? '...' : liveTrains.filter(t => t.scenarioFlags && t.scenarioFlags.includes('CONFLICT_SOURCE')).length}</div>
                <div className="text-[9px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">Triggered</div>
              </div>
            </div>

          </div>

          {/* TABLE SECTION (Detailed & Restored) */}
          <div className="bg-white rounded-sm shadow-sm border border-slate-300 overflow-hidden mb-6">
            <div className="bg-[#1E3A8A] px-4 py-3 border-b-4 border-[#F97316] flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                Live Train Network Status
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 text-xs text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-3 pl-5 border-r border-slate-200">S.NO.</th>
                    <th className="p-3 border-r border-slate-200">Train Details</th>
                    <th className="p-3 border-r border-slate-200">Route</th>
                    <th className="p-3 border-r border-slate-200">Current Station</th>
                    <th className="p-3 border-r border-slate-200">Scheduled Time</th>
                    <th className="p-3 border-r border-slate-200">Actual ETA</th>
                    <th className="p-3 border-r border-slate-200">Live Status</th>
                    <th className="p-3 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 font-semibold text-sm">
                        Syncing with {division} Control...
                      </td>
                    </tr>
                  ) : (
                    filteredTrains.map((train, idx) => {
                      // Calculate ETA dynamically
                      let eta = train.scheduleTime;
                      if (train.scheduleTime && train.delayMinutes > 0) {
                        const [h, m] = train.scheduleTime.split(':').map(Number);
                        const date = new Date(2024, 0, 1, h, m);
                        date.setMinutes(date.getMinutes() + train.delayMinutes);
                        eta = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                      }

                      return (
                        <tr key={train.no} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="p-3 pl-5 font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                          <td className="p-3 border-r border-slate-200">
                            <div className="font-bold text-slate-800 text-sm">{train.no}</div>
                            <div className="text-xs text-slate-500">{train.name}</div>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-sm font-semibold text-slate-800">
                            {train.source} <span className="text-[#1E3A8A] font-black mx-2">➔</span> {train.dest}
                          </td>
                          <td className="p-3 border-r border-slate-200">
                            <div className="flex items-center text-sm font-bold text-[#1E3A8A]">
                              {train.currentLocation}
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-sm font-bold text-slate-600">
                            {train.scheduleTime}
                          </td>
                          <td className="p-3 border-r border-slate-200">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${train.delayMinutes > 45 ? 'text-red-600' : train.delayMinutes > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                {eta}
                              </span>
                              {train.delayMinutes > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  +{train.delayMinutes}m
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-200">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold border ${
                              train.status === 'On Time' ? 'bg-green-50 text-green-700 border-green-200' :
                              train.status === 'Delay Covered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              train.status === 'Delayed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              (train.status === 'Severely Delayed' || train.status === 'Hold') ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {train.status}
                            </span>
                          </td>
                          <td className="p-3 pr-5 text-right">
                            <button onClick={() => navigate(`/forecast/${train.no}`, { state: { trainName: train.name, currentLocation: train.currentLocation } })} className="bg-white border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm">
                              SEE FORECAST
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      

      {/* Conflict Modal Overlay */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-none shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-700">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="bg-red-100 p-2 rounded-none mt-0.5">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-0.5">Critical Operational Conflict</h3>
                  <p className="text-sm font-medium text-slate-500">Platform 2 Occupancy Conflict — NGP</p>
                </div>
              </div>
              <button 
                onClick={() => setIsConflictModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-white">
              
              {/* Trains */}
              <div className="grid grid-cols-2 gap-0 border border-slate-200 rounded-none bg-slate-50">
                <div className="p-4 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Affected Train</div>
                  <div className="text-sm font-bold text-slate-900 mb-2">12626 Kerala Express</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">ETA: 13:45</span>
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 border border-red-200 rounded-none uppercase tracking-wider">+120m Delay</span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Conflicting Train</div>
                  <div className="text-sm font-bold text-slate-900 mb-2">12621 Tamil Nadu Express</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">ETA: 13:45</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 rounded-none uppercase tracking-wider">On Time</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-0 border border-slate-200 rounded-none bg-slate-50 mb-6">
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Platform</div>
                  <div className="text-[13px] font-bold text-slate-800">PF 2</div>
                </div>
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Window</div>
                  <div className="text-[13px] font-bold text-slate-800">13:45 – 13:52</div>
                </div>
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Type</div>
                  <div className="text-[12px] font-bold text-red-600">Arrival Sequence Overlap</div>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Confidence</div>
                  <div className="text-[13px] font-bold text-blue-700 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                    94% Validated
                  </div>
                </div>
              </div>

              {/* AI Sequences Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1.5 h-4 bg-[#1E3A8A]"></div>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight uppercase">AI-Evaluated Movement Sequences</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Recommended Sequence */}
                  <div className="bg-white border-2 border-[#1E3A8A] rounded-none p-4 flex flex-col relative group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-[#1E3A8A] text-white px-2 py-0.5 rounded-none">Recommended</span>
                    </div>
                    <div className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
                      <span className="text-emerald-700">12621 First</span> 
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg> 
                      <span className="text-slate-500">12626</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-5 leading-relaxed">
                      Admit the on-time TN Express to PF 2 first. Regulate Kerala Express at the approach until PF 2 is cleared.<br/>
                      <span className="inline-block mt-3 font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-none border border-slate-200">Est. Network Impact: +6 min</span>
                    </p>
                    <div className="mt-auto">
                      <button onClick={() => setIsConflictModalOpen(false)} className="w-full bg-[#1E3A8A] text-white text-xs font-bold py-2.5 rounded-none hover:bg-blue-900 transition-colors flex items-center justify-center uppercase tracking-wider">
                        Approve Sequence
                      </button>
                    </div>
                  </div>
          
                  {/* Alternative Sequence */}
                  <div className="bg-white border border-slate-300 rounded-none p-4 flex flex-col hover:border-slate-400 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-none border border-slate-200">Alternative</span>
                    </div>
                    <div className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
                      <span className="text-orange-700">12626 First</span> 
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg> 
                      <span className="text-slate-500">12621</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-5 leading-relaxed">
                      Admit Kerala Express to PF 2 first and regulate Tamil Nadu Express at the approach.<br/>
                      <span className="inline-block mt-3 font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 border border-orange-200 rounded-none">Est. Network Impact: +9 min</span>
                    </p>
                    <div className="mt-auto">
                      <button onClick={() => setIsConflictModalOpen(false)} className="w-full bg-white border border-slate-300 text-slate-700 text-xs font-bold py-2.5 rounded-none hover:bg-slate-50 transition-colors flex items-center justify-center uppercase tracking-wider">
                        Select Alternative
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="bg-white border border-slate-200 rounded-none overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-900 uppercase tracking-widest">
                    More Operational Options
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      'Prioritize On-Time Train',
                      'Prioritize Delayed Train',
                      'Evaluate Network Impact',
                      'Check Alternate Route/Platform',
                      'Continue Monitoring',
                      'Manual ATS Decision'
                    ].map((option, idx) => (
                      <div key={idx} className="px-5 py-3 text-xs font-semibold text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                        <span>{option}</span>
                        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSDashboard;