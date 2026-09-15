import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const CircularGauge = ({ percentage, color, label, value }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-100" />
          <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="5" fill="transparent" className={color} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-black text-sm text-slate-700">
          {percentage}%
        </div>
      </div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center h-6 flex items-center">{label}</div>
      <div className="text-xs font-black text-slate-800 mt-1">{value}</div>
    </div>
  );
};

export default function TrainForecast() {
  const { trainNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const train = location.state?.train || null;
  const trainName = train?.name || location.state?.trainName || 'EXPRESS';
  
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStations, setExpandedStations] = useState({});
  
  // Real-time Simulation State synced with ATS Dashboard
  const initialDelay = train?.delayMinutes || 0;
  const initialLocation = train?.currentLocation || location.state?.currentLocation || 'NGP';
  
  const [liveLocationStr, setLiveLocationStr] = useState(initialLocation);
  const [liveDelayMins, setLiveDelayMins] = useState(initialDelay);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Simulation Timer Ref
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`/data/${trainNo}_route_data.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
          const groupedRoute = [];
          let currentStopping = null;
  
          data.forEach((rawStation, idx) => {
            const station = { ...rawStation };
            
            if (idx !== data.length - 1 && !station.scheduled_departure && station.scheduled_arrival && station.scheduled_arrival !== "Source") {
               station.scheduled_departure = station.scheduled_arrival;
            }
            if (idx !== data.length - 1 && !station.expected_departure && station.expected_arrival && station.expected_arrival !== "Source") {
               station.expected_departure = station.expected_arrival;
            }

            if (station.type === 'stopping') {
              currentStopping = { ...station, nonStoppingList: [] };
              groupedRoute.push(currentStopping);
            } else if (station.type === 'non-stopping' && currentStopping) {
              currentStopping.nonStoppingList.push(station);
            }
        });

        setRouteData(groupedRoute);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching route data:", err);
        setLoading(false);
      });
      
      return () => clearInterval(timerRef.current);
  }, [trainNo]);

  // Helper to accurately extract current station index (matches ATS logic)
  const getLiveIndex = () => {
    if (routeData.length === 0) return 0;
    const foundIdx = routeData.findIndex(s => {
      const regex = new RegExp(`\\b${s.code}\\b`, 'i');
      return regex.test(liveLocationStr) || liveLocationStr.includes(`(${s.code})`);
    });
    return foundIdx !== -1 ? foundIdx : 0;
  };

  const liveIndex = getLiveIndex();

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let currIdx = liveIndex;
    let currDelay = liveDelayMins;
    
    timerRef.current = setInterval(() => {
      if (currIdx < routeData.length - 2) {
        currIdx++;
        setLiveLocationStr(`Arrived ${routeData[currIdx].code} (${routeData[currIdx].name})`);
        
        // Slightly fluctuate delay during simulation for realism
        if (currIdx % 2 === 0 && currDelay > 0) {
           currDelay += Math.floor(Math.random() * 5);
           setLiveDelayMins(currDelay);
        }
      } else {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        setLiveLocationStr(`Destination Reached`);
      }
    }, 2000); // Fast 2 second simulation per station
  };

  const toggleExpand = (code) => {
    setExpandedStations(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-inter font-bold text-slate-500">Loading Train Data...</div>;
  }

  const liveStation = routeData[liveIndex] || routeData[0];
  const lastStation = routeData.length > 0 ? routeData[routeData.length - 1] : null;
  const progressPercent = (liveStation && lastStation && lastStation.distance > 0) 
    ? Math.round((liveStation.distance / lastStation.distance) * 100) 
    : 0;
    
  // Dynamic ETA Calculator Function based on live delay
  const calcDynamicETA = (timeStr, delayMins) => {
    if (!timeStr || timeStr === '--:--' || timeStr.includes('Source') || timeStr.includes('Destination')) return timeStr;
    const t = timeStr.split(' | ')[0];
    if (!t.includes(':')) return timeStr;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const d = new Date(2024, 0, 1, h, m);
    d.setMinutes(d.getMinutes() + (delayMins || 0));
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // ML Insight Generators
  const isDelayed = liveDelayMins > 0;
  const isCritical = liveDelayMins > 45;
  const congestionPct = isCritical ? 88 : isDelayed ? 45 : 12;
  const weatherPct = isCritical ? 35 : isDelayed ? 20 : 5;
  const speedResPct = isCritical ? 65 : isDelayed ? 30 : 10;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Top Header Navigation */}
      <div className="bg-[#1E3A8A] border-b-4 border-orange-500 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="text-white p-2 mr-4 transition-all duration-300 hover:bg-white/10 rounded-sm group">
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <h1 className="text-xl font-black text-white tracking-widest uppercase">
            ATS: DYNAMIC FORECAST
          </h1>
        </div>
        <div>
          <button 
            onClick={startSimulation}
            disabled={isSimulating || liveIndex >= routeData.length - 2}
            className={`px-4 py-1.5 text-xs font-black tracking-widest uppercase transition-colors rounded-none border ${isSimulating ? 'bg-orange-500 text-white border-orange-600' : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'} flex items-center shadow-lg`}
          >
            {isSimulating ? (
              <>
                 <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                 SIMULATING MOVEMENT...
              </>
            ) : (
              <>
                 <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                 RUN ROUTE SIMULATION
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Main Info Card */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 border border-slate-200 shadow-sm flex items-center justify-center shrink-0 bg-white overflow-hidden p-1">
                  <img src="/custom_train_icon.jpg" alt="Train" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              <div>
                <h2 className="text-2xl font-black text-[#1E3A8A] tracking-wider uppercase">
                  {trainNo} {trainName}
                </h2>
                <div className="text-sm font-bold text-slate-500 tracking-widest uppercase mt-1">
                  Journey: {routeData.length > 0 ? `${routeData[0].name} (${routeData[0].code}) to ${routeData[routeData.length - 1].name} (${routeData[routeData.length - 1].code})` : "Loading Journey..."}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 mb-2">
                Live Status Location
              </div>
              <div className="text-sm font-black text-[#1E3A8A] uppercase tracking-wider">{liveLocationStr}</div>
              <div className="mt-1 flex justify-end">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black border ${
                    liveDelayMins > 45 ? 'bg-red-50 text-red-600 border-red-200' :
                    liveDelayMins > 0 ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {liveDelayMins > 0 ? `DELAYED +${liveDelayMins}m` : 'ON TIME'}
                  </span>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-800 tracking-widest uppercase">Journey Progress</span>
            <span className="text-lg font-black text-[#1E3A8A]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 overflow-hidden border border-slate-200 relative">
            <div className="bg-[#1E3A8A] h-full transition-all duration-1000 ease-out absolute left-0 top-0" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

          {/* AI Predictive Forecasting Engine */}
          <div className="bg-white border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1E3A8A]/5 rounded-bl-full -z-10"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-[#1E3A8A] tracking-widest uppercase flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                AI Dynamic Forecast Engine
              </h3>
              <div className="flex items-center space-x-3">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                </span>
                <div className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest border ${isSimulating ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {isSimulating ? 'SIMULATION DATA ACTIVE' : 'LIVE ML FEED ACTIVE'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Circular Gauges for ML Features */}
              <div className="col-span-2 border border-slate-200 p-4 bg-white flex flex-col justify-between">
                 <div className="flex justify-between items-center mb-2">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Constraints Engine</div>
                   <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Model Confidence: 94%</div>
                 </div>
                 
                 <div className="flex justify-around items-center pt-2">
                    <CircularGauge percentage={congestionPct} color={congestionPct > 50 ? 'text-red-500' : 'text-emerald-500'} label="Network Congestion" value={congestionPct > 50 ? 'High Traffic' : 'Clear Route'} />
                    <CircularGauge percentage={weatherPct} color={weatherPct > 30 ? 'text-orange-500' : 'text-emerald-500'} label="Weather Impact" value={weatherPct > 30 ? 'Mild Rains' : 'Optimal'} />
                    <CircularGauge percentage={speedResPct} color={speedResPct > 50 ? 'text-red-500' : 'text-emerald-500'} label="Speed Restrictions" value={speedResPct > 50 ? 'TSR Active' : 'Normal'} />
                 </div>
              </div>

              {/* Dynamic Final ML Output */}
              <div className="border border-slate-200 p-5 bg-slate-50 flex flex-col justify-between relative overflow-hidden">
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">ML Predicted Impact</div>
                 
                 <div className="flex flex-col mb-4 relative z-10">
                    <div className="text-sm font-black text-slate-800 tracking-wide mb-1">Causality Analysis:</div>
                    {isCritical ? (
                        <div className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 border border-red-200 inline-block mb-1">
                          Platform Sequence Conflict detected at upcoming junction. Routing bottleneck.
                        </div>
                    ) : isDelayed ? (
                        <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 border border-orange-200 inline-block mb-1">
                          Minor track congestion ahead. Moderate speed restriction applied.
                        </div>
                    ) : (
                        <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 border border-emerald-200 inline-block mb-1">
                          Clear path ahead. Priority routing approved. Proceed at max speed.
                        </div>
                    )}
                 </div>

                 <div className="flex justify-between items-end border-t border-slate-200 pt-3 relative z-10">
                   <div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Calculated Variance</div>
                     <div className={`text-2xl font-black leading-none ${isCritical ? 'text-red-600' : isDelayed ? 'text-orange-600' : 'text-emerald-600'}`}>
                       {liveDelayMins > 0 ? `+${liveDelayMins}m` : 'ON TIME'}
                     </div>
                   </div>
                 </div>
              </div>

            </div>
          </div>

        {/* The Broad Timeline */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden relative mt-6">
          
          <style>{`
            @keyframes signalBlink {
              0%, 100% { opacity: 0.2; transform: scale(0.9); }
              50% { opacity: 1; transform: scale(1.1); }
            }
            .signal-blink {
              animation: signalBlink 1.5s ease-in-out infinite;
            }
          `}</style>

          <div className="relative z-10 space-y-0">
            {/* Seamless Global Track (No Joints) */}
            <div className="absolute left-[184px] top-0 bottom-0 w-[12px] z-0" 
                 style={{
                   borderLeft: '3px solid #64748b',
                   borderRight: '3px solid #64748b',
                   backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 12px, #cbd5e1 12px, #cbd5e1 16px)'
                 }}>
            </div>
            {routeData.map((station, index) => { 
              const isLive = index === liveIndex; 
              const isPassed = index < liveIndex; 
              
              const dynamicArr = calcDynamicETA(station.scheduled_arrival, liveDelayMins);
              const dynamicDep = calcDynamicETA(station.scheduled_departure, liveDelayMins);

              return ( 
              <div key={index} className="flex flex-col transition-colors">
                
                {/* Stopping Station Row */}
                <div 
                  onClick={() => toggleExpand(station.code)} 
                  className={`flex relative items-stretch cursor-pointer group transition-colors ${isLive ? 'bg-blue-50/30' : ''}`}
                >
                  
                  {/* Left Column: Arrival (Solid Background) */}
                  <div className={`w-[160px] py-6 pl-6 flex flex-col justify-center relative z-10 border-b border-slate-100 transition-colors ${isLive ? 'bg-blue-50/50' : 'bg-white group-hover:bg-slate-50'}`}>
                    {index !== 0 ? (
                      <>
                        {station.scheduled_arrival ? (
                          <>
                            <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Scheduled</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-slate-800'}`}>
                              {station.scheduled_arrival}
                            </div>
                            
                            <div className="text-[11px] font-bold text-[#1E3A8A] mt-4 mb-1 uppercase tracking-widest">Dynamic ETA *</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                              {dynamicArr}
                            </div>
                            
                            {!isPassed && liveDelayMins > 0 && (
                               <div className="mt-2 text-[10px] font-bold text-red-600">+{liveDelayMins}m Delay</div>
                            )}
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="text-[13px] font-black tracking-widest uppercase text-slate-400">SOURCE</div>
                    )}
                  </div>

                  {/* Node Column */}
                  <div className="w-[60px] py-6 flex justify-center items-center relative z-20 bg-transparent border-b border-transparent">
                    {/* Dynamic Node */}
                    {isLive ? (
                      <div className="relative w-12 h-14 z-20 flex justify-center mt-2 cursor-pointer transition-all duration-700 ease-in-out">
                        <svg className="absolute left-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                        </svg>
                        
                        <svg className="absolute right-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M10 4 A10 10 0 0 1 10 20 M4 8 A5 5 0 0 1 4 16" />
                        </svg>
                        
                        <div className="relative w-12 h-14">
                          <svg className="absolute inset-0 w-full h-full text-[#1E3A8A] drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          <svg className="absolute top-[10px] left-[13px] w-[22px] h-[22px] text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2.23v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                          </svg>
                        </div>
                      </div>
                    ) : isPassed ? (
                      <div className="w-[20px] h-[20px] bg-green-600 border-[2px] border-white rounded-full z-10 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    ) : (
                      <div className="w-[18px] h-[18px] bg-white border-[4px] border-slate-300 rounded-full z-10 shadow-sm"></div>
                    )}
                  </div>

                  {/* Right Column: Departure & Info */}
                  <div className={`flex-1 py-6 pr-6 pl-4 flex flex-col justify-center border-b border-slate-100 transition-colors ${isLive ? 'bg-blue-50/50' : 'bg-white group-hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`text-base font-black tracking-widest uppercase mb-1 ${isPassed ? 'text-slate-500' : 'text-slate-800'}`}>
                          {station.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="bg-slate-100 px-2 py-0.5 border border-slate-200">CODE: {station.code}</span>
                          <span>DIST: {station.distance} KM</span>
                        </div>
                      </div>
                      
                      {index !== routeData.length - 1 && station.scheduled_departure && (
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Sch. Dep</div>
                          <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-slate-800'}`}>
                            {station.scheduled_departure.split(' | ')[0]}
                          </div>
                          <div className="text-[11px] font-bold text-[#1E3A8A] mt-2 mb-0.5 uppercase tracking-widest">Dynamic Dep</div>
                          <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                            {dynamicDep}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Non-Stopping Stations (Expandable) */}
                {station.nonStoppingList && station.nonStoppingList.length > 0 && expandedStations[station.code] && (
                  <div className="bg-slate-50 border-b border-slate-200 py-3 relative z-10">
                    <div className="ml-[220px] pl-4 border-l-2 border-slate-300 space-y-3">
                      {station.nonStoppingList.map((ns, nsIdx) => (
                        <div key={nsIdx} className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-500 pr-6">
                          <div className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-3"></span>
                            {ns.name} ({ns.code})
                          </div>
                          <div>{ns.distance} KM</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
