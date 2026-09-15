import React, { useEffect, useState } from 'react';
import { simStore as simulationStore } from '../store/SimulationStore';
 // I might need to move this or redefine it

export default function PassengerTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTrain, setSearchedTrain] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    const term = searchTerm.toLowerCase();
    
    if (term.includes('12626') || term.includes('kerala')) {
      setSearchedTrain('12626');
    } else if (term.includes('12621') || term.includes('tamil') || term.includes('tn')) {
      setSearchedTrain('12621');
    } else {
      alert("No live telemetry found for this train number/name in the current network.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col relative overflow-x-hidden">
      {/* Top Navigation */}
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shadow-md z-50">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
          <h1 className="text-base font-black tracking-widest uppercase font-montserrat">RailSamay <span className="text-orange-500">Passenger</span></h1>
        </div>
        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          Live Tracking Portal
        </div>
      </div>

      {!searchedTrain ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 font-montserrat tracking-tight">Track Your Train</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Enter your train number or name to access real-time telemetry and dynamic ETA.</p>
            
            <form onSubmit={handleSearch} className="flex flex-col space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Train Number or Name</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., 12626 or Kerala Express" 
                  className="w-full border-2 border-slate-200 px-4 py-3 text-slate-800 font-bold focus:border-[#1E3A8A] focus:outline-none transition-colors"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#1E3A8A] hover:bg-[#152a66] text-white font-black uppercase tracking-widest py-3 transition-colors shadow-md"
              >
                Track Live Status
              </button>
            </form>
          </div>
        </div>
      ) : (
        <PassengerForecastView trainNo={searchedTrain} onBack={() => setSearchedTrain(null)} />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// PASSENGER TRACKING VIEW COMPONENT
// ------------------------------------------------------------
function PassengerForecastView({ trainNo, onBack }) {
  const [routeData, setRouteData] = useState([]);
  const [train, setTrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedStations, setExpandedStations] = useState({});

  useEffect(() => {
    // Fetch route data
    setLoading(true);
    fetch(`/data/${trainNo}_route_data.json`)
      .then(res => res.json())
      .then(data => {
        setRouteData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching route data:", err);
        setLoading(false);
      });
  }, [trainNo]);

  useEffect(() => {
    // Sync with simulation store
    const updateTrain = () => {
      const activeTrain = simulationStore.trains.find(t => t.no === trainNo);
      setTrain(activeTrain);
    };
    updateTrain();
    const unsubscribe = simulationStore.subscribe(updateTrain);
    return () => unsubscribe();
  }, [trainNo]);

  const toggleExpand = (code) => {
    setExpandedStations(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const getPredictiveDelayProfile = (tNo, stCode) => {
      let flatIdx = 0;
      let targetIdx = -1;
      for (let i=0; i<routeData.length; i++) {
         if (routeData[i].code === stCode) targetIdx = flatIdx;
         flatIdx++;
         if (routeData[i].nonStoppingList) {
             for (let j=0; j<routeData[i].nonStoppingList.length; j++) {
                 if (routeData[i].nonStoppingList[j].code === stCode) targetIdx = flatIdx;
                 flatIdx++;
             }
         }
      }
      
      const liveDelay = train?.delayMinutes || 0;
      if (liveDelay === 0 || targetIdx === -1) return liveDelay;

      const currentLocation = train?.currentLocation || '';
      
      const isMatch = (code) => {
          const regex = new RegExp(`\\b${code}\\b|\\(${code}\\)`);
          return regex.test(currentLocation);
      };

      const findFlatIndex = (code) => {
          let fIdx = 0;
          for (let i=0; i<routeData.length; i++) {
             if (isMatch(routeData[i].code)) return fIdx;
             fIdx++;
             if (routeData[i].nonStoppingList) {
                 for (let j=0; j<routeData[i].nonStoppingList.length; j++) {
                     if (isMatch(routeData[i].nonStoppingList[j].code)) return fIdx;
                     fIdx++;
                 }
             }
          }
          return -1;
      };

      const liveIdx = findFlatIndex(null); // this will use isMatch inside
      
      if (liveIdx !== -1 && targetIdx > liveIdx) {
          const distance = targetIdx - liveIdx;
          if (tNo === '12626') {
              const recovered = Math.min(Math.floor(distance * 3), liveDelay - 15); 
              return Math.max(15, liveDelay - recovered);
          } else if (tNo === '12621') {
              const recovered = Math.min(Math.floor(distance * 4), liveDelay);
              return Math.max(0, liveDelay - recovered);
          }
      }
      
      return liveDelay;
  };

  if (loading) {
    return <div className="p-10 flex justify-center text-slate-500 font-bold tracking-widest uppercase">Initializing Telemetry Link...</div>;
  }

  const trainName = trainNo === '12626' ? 'KERALA EXPRESS' : 'TAMIL NADU EXP';
  const currentLocation = train?.currentLocation || 'Awaiting Data';
  const liveDelay = train?.delayMinutes || 0;

  const calculateDynamicETA = (timeStr, delayMins) => {
    if (!timeStr || timeStr === '--:--' || timeStr.includes('Source') || timeStr.includes('Destination')) return timeStr;
    const parts = timeStr.split(' | ');
    if (parts.length !== 2) return timeStr;
    const timeParts = parts[0].split(':');
    if (timeParts.length !== 2) return timeStr;

    let h = parseInt(timeParts[0], 10);
    let m = parseInt(timeParts[1], 10);
    
    m += delayMins;
    const extraHours = Math.floor(m / 60);
    m = m % 60;
    h = (h + extraHours) % 24;
    
    const formattedH = h.toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} | ${parts[1]}`;
  };

  const formatDelayTime = (mins) => {
      if (mins <= 0) return 'ON TIME';
      const h = Math.floor(mins / 60).toString().padStart(2, '0');
      const m = (mins % 60).toString().padStart(2, '0');
      return `Delay: ${h}:${m}`;
  };

  const isMatch = (code) => {
      const regex = new RegExp(`\\b${code}\\b|\\(${code}\\)`);
      return regex.test(currentLocation);
  };

  let liveStation = routeData.length > 0 ? routeData[0] : null;
  let exactDistance = 0;
  for (const s of routeData) {
      if (isMatch(s.code)) {
          liveStation = s;
          exactDistance = s.distance;
          break;
      }
      if (s.nonStoppingList) {
          const ns = s.nonStoppingList.find(n => isMatch(n.code));
          if (ns) {
              liveStation = s;
              exactDistance = ns.distance;
              break;
          }
      }
  }
  
  const lastStation = routeData.length > 0 ? routeData[routeData.length - 1] : null;
  const progressPercent = (exactDistance > 0 && lastStation && lastStation.distance > 0) 
    ? Math.round((exactDistance / lastStation.distance) * 100) 
    : 0;

  // Passenger Status Block Logic (Same text as ATS, but without gauges)
  let assessmentClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  let assessmentText = 'Clear path ahead. Proceed at optimal speed.';
  let varianceColor = 'text-emerald-600';
  let varianceBadge = 'ON TIME';
  let varianceBadgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  
  let upcomingStation = lastStation;
  let tempMainIndex = routeData.findIndex(s => {
      if (isMatch(s.code)) return true;
      if (s.nonStoppingList) {
          return s.nonStoppingList.some(ns => isMatch(ns.code));
      }
      return false;
  });
  if (tempMainIndex !== -1 && tempMainIndex + 1 < routeData.length) {
      upcomingStation = routeData[tempMainIndex + 1];
  }
  let arrivalTime = upcomingStation ? (upcomingStation.scheduled_arrival !== 'Source' ? upcomingStation.scheduled_arrival : (upcomingStation.arrival_time || '00:00')) : '00:00';

  if (liveDelay > 0) {
      varianceColor = 'text-red-600';
      varianceBadge = formatDelayTime(liveDelay);
      varianceBadgeClass = 'bg-red-100 text-red-700 border-red-200';
      arrivalTime = calculateDynamicETA(arrivalTime, liveDelay);

      assessmentClass = 'bg-red-100 text-red-700 border-red-200';
      if (trainNo === '12626') {
          assessmentText = `Current Status at ${currentLocation}: Train is operating with a ${formatDelayTime(liveDelay)}. Root Cause: Severe network congestion and adverse weather cascading into a Platform Sequence Conflict at upcoming NGP junction.`;
      } else {
          assessmentText = `Current Status at ${currentLocation}: Train is operating with a ${formatDelayTime(liveDelay)}. Root Cause: Minor origin delay. System has engaged compensatory speed limits to fully recover time.`;
      }
  } else {
      if (trainNo === '12621' && liveStation && liveStation.code !== 'BPQ') {
          assessmentText = `Current Status at ${currentLocation}: Train is ON TIME (Delay successfully recovered). Root Cause: Clear path ahead and optimal speed maintained.`;
      } else {
          assessmentText = `Current Status at ${currentLocation}: Train is perfectly ON TIME. Root Cause: Clear path ahead and optimal operational conditions.`;
      }
  }

  return (
    <div className="flex flex-col flex-1 p-6 max-w-6xl mx-auto w-full">
      <style>{`
        @keyframes signalBlink {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .signal-blink {
          animation: signalBlink 1.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Top Header Block */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={onBack} className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-[#1E3A8A] transition-colors mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Search
          </button>
          <h2 className="text-3xl font-black text-[#1E3A8A] font-montserrat tracking-tight uppercase">
            {trainNo} {trainName}
          </h2>
          <div className="text-sm font-bold text-slate-500 tracking-widest uppercase mt-1">
            Journey: {routeData.length > 0 ? `${routeData[0].name} (${routeData[0].code}) to ${routeData[routeData.length - 1].name} (${routeData[routeData.length - 1].code})` : "Loading Journey..."}
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-slate-800 tracking-widest uppercase">Journey Progress</span>
          <span className="text-lg font-black text-[#1E3A8A]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 overflow-hidden border border-slate-200 relative">
          <div className="bg-[#1E3A8A] h-full transition-all duration-1000 ease-out absolute left-0 top-0" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Passenger Status & Forecast Block (NO GAUGES) */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 mb-8 relative overflow-hidden">
        <div className="border border-slate-200 p-5 bg-slate-50 flex flex-col justify-between relative overflow-hidden">
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex justify-between items-center">
             <span>Live Operational Status</span>
             <span className="text-orange-500 font-black tracking-widest border border-orange-200 bg-orange-50 px-2 py-0.5">TRACKING ACTIVE</span>
           </div>
           
           <div className="flex flex-col mb-4 relative z-10">
              <div className="text-sm font-black text-slate-800 tracking-wide mb-1">Diagnostic Assessment:</div>
              <div className={`text-xs font-semibold px-2 py-1 border inline-block mb-1 ${assessmentClass}`}>
                {assessmentText}
              </div>
           </div>

           <div className="flex justify-between items-end border-t border-slate-200 pt-3 relative z-10">
             <div>
               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Arrival Variance ({upcomingStation?.code || 'Destination'})</div>
               <div className={`text-3xl font-black leading-none ${varianceColor}`}>{arrivalTime}</div>
             </div>
             <div className={`text-xs font-black px-2 py-1 border ${varianceBadgeClass}`}>
               {varianceBadge}
             </div>
           </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800"></div>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-[13px] font-black tracking-widest text-slate-800 uppercase">Live Journey Map</h3>
        </div>
        
        <div className="p-0">
          <div className="relative">
            <div className="absolute left-[200px] top-0 bottom-0 w-[4px] bg-slate-200 z-0 hidden md:block">
               <div className="absolute top-0 bottom-0 left-0 right-0 z-0 opacity-20" 
                 style={{ 
                   backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 12px, #cbd5e1 12px, #cbd5e1 16px)'
                 }}>
               </div>
            </div>
            
            {routeData.map((station, index) => { 
              let liveMainIndex = 0;
              let activeNSCode = null;
              
              if (routeData.length > 0) {
                liveMainIndex = routeData.findIndex(s => {
                  if (isMatch(s.code)) return true;
                  if (s.nonStoppingList && s.nonStoppingList.some(ns => {
                      if (isMatch(ns.code)) { activeNSCode = ns.code; return true; }
                      return false;
                  })) return true;
                  return false;
                });
                if (liveMainIndex === -1) liveMainIndex = 0;
              }

              const isPassed = index < liveMainIndex;
              const isLiveMain = index === liveMainIndex && activeNSCode === null;
              const shouldExpandNS = index === liveMainIndex && activeNSCode !== null;
              
              let nodeDelay = getPredictiveDelayProfile(trainNo, station.code);
              
              let nodeStatus = 'On Time';
              let nodeStatusClass = 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]';
              
              if (nodeDelay > 0) {
                nodeStatus = formatDelayTime(nodeDelay);
                nodeStatusClass = isPassed ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] opacity-70' : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]';
              } else if (isPassed) {
                nodeStatusClass = 'bg-slate-100 text-slate-500 border border-slate-200';
              }

              const displayExpectedArrival = calculateDynamicETA(station.scheduled_arrival, nodeDelay);
              const displayExpectedDeparture = calculateDynamicETA(station.scheduled_departure, nodeDelay);
              
              return ( 
              <div key={index} className="flex flex-col transition-colors">
                
                {/* Main Station Row */}
                <div className={`flex relative items-stretch border-b border-slate-100 ${isLiveMain ? 'bg-blue-50/30' : 'bg-white group hover:bg-slate-50'}`}>
                  
                  {/* Left Column: Arrival */}
                  <div className="w-[198px] py-6 pl-6 flex flex-col justify-center text-left relative z-10">
                    {index !== 0 ? (
                      <>
                        {station.scheduled_arrival ? (
                          <>
                            <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Scheduled</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                              {station.scheduled_arrival}
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 mt-4 mb-1 uppercase tracking-widest">Expected *</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                              {displayExpectedArrival}
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="text-[13px] font-black tracking-widest uppercase text-slate-400">SOURCE</div>
                    )}
                  </div>

                  {/* Middle Column: Node Indicator */}
                  <div className="w-[8px] flex justify-center items-center relative z-20 py-6">
                    {isLiveMain ? (
                      <div className="relative w-12 h-14 z-20 flex justify-center mt-2 cursor-pointer">
                        {/* Left Broadcast Signal */}
                        <svg className="absolute left-[-16px] top-[10px] w-5 h-7 text-orange-500 signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                        </svg>
                        
                        {/* Right Broadcast Signal */}
                        <svg className="absolute right-[-16px] top-[10px] w-5 h-7 text-orange-500 signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M10 4 A10 10 0 0 1 10 20 M4 8 A5 5 0 0 1 4 16" />
                        </svg>
                        
                        {/* Marker Body */}
                        <div className="relative w-12 h-14">
                          <svg className="absolute inset-0 w-full h-full text-[#1E3A8A] drop-shadow-xl" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          <svg className="absolute top-[10px] left-[13px] w-[22px] h-[22px] text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2.23v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-4 z-10 ${isPassed ? 'bg-slate-300 border-white' : 'bg-white border-[#1E3A8A]'}`}></div>
                    )}
                  </div>

                  {/* Right-Middle Column: Station Info */}
                  <div className="flex-1 py-6 pl-8 flex flex-col justify-center relative z-10">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`text-[15px] font-black tracking-widest uppercase ${isPassed ? 'text-slate-400' : 'text-[#1E3A8A]'}`}>
                        {station.code}
                      </span>
                      <span className={`text-[15px] font-black tracking-wider uppercase ${isPassed ? 'text-slate-600' : 'text-slate-800'}`}>
                        {station.name}
                      </span>
                      
                      {station.nonStoppingList && station.nonStoppingList.length > 0 && (
                        <button 
                          onClick={() => toggleExpand(station.code)}
                          className="ml-2 flex items-center space-x-1 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 uppercase tracking-widest hover:bg-orange-100 transition-colors"
                        >
                          <span>{expandedStations[station.code] ? 'Hide Details' : `+ ${station.nonStoppingList.length} Nodes`}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center text-[10px] font-bold text-slate-500 space-x-4 tracking-widest mt-1">
                      <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> {station.distance} Kms</span>
                      <span className="text-slate-300">|</span>
                      <span>{station.platform || 'PF-1'}</span>
                    </div>
                  </div>

                  {/* Right Column: Departure */}
                  <div className="w-[160px] py-6 pr-6 flex flex-col justify-center text-right relative z-10">
                    {index !== routeData.length - 1 ? (
                      <>
                        {station.scheduled_departure ? (
                          <>
                            <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Scheduled</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                              {station.scheduled_departure}
                            </div>
                            
                            <div className="text-[11px] font-bold text-slate-500 mt-4 mb-1 uppercase tracking-widest">Expected *</div>
                            <div className={`text-[13px] font-black tracking-wide ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                              {displayExpectedDeparture}
                            </div>
                            
                            <div className="mt-3 flex justify-end">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none ${nodeStatusClass}`}>
                                {nodeStatus}
                              </span>
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="text-[13px] font-black tracking-widest uppercase text-slate-400">DESTINATION</div>
                    )}
                  </div>
                  
                </div>

                {/* Expanded Non-Stopping Stations Row */}
                {station.nonStoppingList && station.nonStoppingList.length > 0 && (expandedStations[station.code] || shouldExpandNS) && (
                  <div className="w-full border-l-[6px] border-orange-500">
                    {station.nonStoppingList.map((ns, i) => {
                      const nsIsPassed = isPassed || (index === liveMainIndex && activeNSCode !== null && station.nonStoppingList.findIndex(n => n.code === activeNSCode) > i);
                      
                      let nsDelay = getPredictiveDelayProfile(trainNo, ns.code);
                      
                      let nsStatus = 'On Time';
                      let nsStatusClass = 'bg-[#DCFCE7] text-[#166534]';
                      if (nsDelay > 0) {
                          nsStatus = formatDelayTime(nsDelay);
                          nsStatusClass = nsIsPassed ? 'bg-[#FEE2E2] text-[#991B1B] opacity-80' : 'bg-[#FEE2E2] text-[#991B1B]';
                      } else if (nsIsPassed) {
                          nsStatusClass = 'bg-slate-200 text-slate-600';
                      }
                      
                      return (
                      <div key={i} className="flex relative items-stretch border-b border-orange-200">
                        
                        <div className="w-[154px] pl-4 flex flex-col justify-center bg-[#FFF9F0] relative z-10 py-4">
                          <span className="inline-block px-3 py-1 text-[9px] font-black text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] rounded-none uppercase tracking-widest shadow-none w-max">
                            Non-Stopping
                          </span>
                        </div>

                        <div className="w-[60px] flex justify-center items-center relative z-20 bg-transparent py-4">
                          {activeNSCode === ns.code ? (
                            <div className="relative w-12 h-14 z-20 flex justify-center cursor-pointer scale-[0.85]">
                              <svg className="absolute left-[-16px] top-[10px] w-5 h-7 text-orange-500 signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                              </svg>
                              <svg className="absolute right-[-16px] top-[10px] w-5 h-7 text-orange-500 signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
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
                          ) : (
                            <div className="w-2 h-2 bg-slate-300 rounded-full z-10"></div>
                          )}
                        </div>

                        <div className="flex-1 pl-4 py-4 bg-[#FFF9F0] relative z-10">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="text-[13px] font-black text-[#1E3A8A] tracking-widest uppercase">{ns.code}</span>
                            <span className="text-[13px] font-black text-slate-800 tracking-wider uppercase">{ns.name}</span>
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-none ${nsStatusClass}`}>
                              {nsStatus}
                            </span>
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-slate-500 space-x-4 tracking-widest mt-1">
                            <span>{ns.distance} Kms</span>
                            <span className="text-slate-300">|</span>
                            <span>Arrival Time: {calculateDynamicETA(ns.arrival_time, nsDelay)}</span>
                            <span className="text-slate-300">|</span>
                            <span>Departure Time: {calculateDynamicETA(ns.departure_time, nsDelay)}</span>
                          </div>
                        </div>

                        <div className="w-[160px] pr-6 flex flex-col justify-center items-end bg-[#FFF9F0] relative z-10 py-4">
                          <span className="inline-block px-3 py-1 text-[9px] font-black text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] rounded-none uppercase tracking-widest shadow-none">
                            Non-Stopping
                          </span>
                        </div>

                      </div>
                    );
                    })}
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
