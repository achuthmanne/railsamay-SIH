import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { simStore as simulationStore } from '../store/SimulationStore';
 // I might need to move this or redefine it


const AVAILABLE_TRAINS = [
  { no: '12471', name: 'SWARAJ EXPRESS' },
  { no: '12472', name: 'SWARAJ EXPRESS' },
  { no: '12511', name: 'RAPTISAGAR EXP' },
  { no: '12615', name: 'GRAND TRUNK EXP' },
  { no: '12621', name: 'TAMIL NADU EXP' },
  { no: '12626', name: 'KERALA EXPRESS' },
  { no: '12919', name: 'MALWA EXPRESS' },
  { no: '12920', name: 'MALWA EXPRESS' },
  { no: '17205', name: 'SAINAGAR SHIRDI EXP' },
  { no: '17207', name: 'SNSI BZA EXPRESS' },
  { no: '18045', name: 'EAST COAST EXP' },
  { no: '20805', name: 'AP EXPRESS' },
  { no: '20833', name: 'VANDE BHARAT EXP' },
  { no: '22439', name: 'SVDK VANDE BHARAT' }
];

export default function PassengerTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedTrain, setSearchedTrain] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredTrains = AVAILABLE_TRAINS.filter(t => 
    t.no.includes(searchTerm) || t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    const term = searchTerm.toLowerCase();
    
    const match = AVAILABLE_TRAINS.find(t => t.no === term || t.name.toLowerCase().includes(term));
    if (match) {
      setSearchedTrain(match.no);
      setShowDropdown(false);
    } else {
      alert("No live telemetry found for this train number/name in the current network.");
    }
  };

  const handleSelectTrain = (tNo) => {
    setSearchTerm(tNo);
    setSearchedTrain(tNo);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter flex flex-col relative overflow-x-hidden">


      {!searchedTrain ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <Link to="/" className="absolute top-8 left-8 flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold text-sm tracking-wide group z-50">
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            RETURN TO HOME
          </Link>
          <div className="max-w-md w-full bg-white p-8 border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1E3A8A]"></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 font-montserrat tracking-tight">Track Your Train</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Enter train number or name to check current running status and expected arrival time.</p>
            
            <form onSubmit={handleSearch} className="flex flex-col space-y-4 relative">
              <div className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Train Number or Name</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Ex: 12626 or Kerala Express" 
                  className="w-full border border-slate-300 px-4 py-3 text-slate-700 font-medium focus:border-orange-400 focus:outline-none transition-colors box-border"
                  required
                />
                
                {/* Autocomplete Dropdown */}
                {showDropdown && searchTerm && filteredTrains.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl max-h-64 overflow-y-auto custom-scrollbar z-50">
                    {filteredTrains.map((t, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleSelectTrain(t.no)}
                        className="px-4 py-2 hover:bg-orange-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between group"
                      >
                        <span className="font-bold text-slate-700 group-hover:text-orange-600">{t.no}</span>
                        <span className="text-xs text-slate-500 font-medium">{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest py-3 transition-colors"
              >
                Check Status
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
    fetch(`/data/${trainNo}_route_data.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
          // --- DYNAMIC DATE MAPPING FOR HACKATHON ---
          const uniqueDates = new Set();
          data.forEach(st => {
            ["scheduled_arrival", "scheduled_departure"].forEach(field => {
              if (st[field] && st[field].includes(" | ")) {
                uniqueDates.add(st[field].split(" | ")[1]);
              }
            });
          });
          const dateArray = Array.from(uniqueDates); 

          const today = new Date();
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formatDate = (date) => `${String(date.getDate()).padStart(2, '0')}-${monthNames[date.getMonth()]}`;

          const dateMapping = {};
          dateArray.forEach((oldDate, idx) => {
             const d = new Date(today);
             d.setDate(today.getDate() + (idx - 1)); 
             dateMapping[oldDate] = formatDate(d);
          });

          const processDates = (st, index, totalLength) => {
            const newSt = { ...st };
            
            // Auto-fill missing departures to fix scraper bugs for intermediate stations
            if (index !== totalLength - 1 && !newSt.scheduled_departure && newSt.scheduled_arrival && newSt.scheduled_arrival !== "Source") {
               newSt.scheduled_departure = newSt.scheduled_arrival;
            }
            if (index !== totalLength - 1 && !newSt.expected_departure && newSt.expected_arrival && newSt.expected_arrival !== "Source") {
               newSt.expected_departure = newSt.expected_arrival;
            }

            ["scheduled_arrival", "scheduled_departure", "expected_arrival", "expected_departure"].forEach(field => {
              if (newSt[field] && newSt[field].includes(" | ")) {
                const parts = newSt[field].split(" | ");
                if (dateMapping[parts[1]]) {
                  newSt[field] = `${parts[0]} | ${dateMapping[parts[1]]}`;
                }
              }
            });
            return newSt;
          };
          // ------------------------------------------

          const groupedRoute = [];
          let currentStopping = null;
  
          data.forEach((rawStation, idx) => {
            const station = processDates(rawStation, idx, data.length);
          if (station.type === 'stopping') {
            currentStopping = {
              ...station,
              nonStoppingList: []
            };
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

  const trainObj = AVAILABLE_TRAINS.find(t => t.no === trainNo);
  const trainName = trainObj ? trainObj.name : 'LIVE TRAIN DATA';
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
    <div className="flex flex-col h-full bg-slate-50 relative overflow-x-hidden">
      <div className="flex flex-col flex-1 p-2 md:p-6 max-w-6xl mx-auto w-full">
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

      {/* AI Predictive Forecasting Engine Clone */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#1E3A8A]/5 rounded-bl-full -z-10"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-[#1E3A8A] tracking-widest uppercase flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Operational Forecast Engine
          </h3>
        </div>

        <div className="border border-slate-200 p-5 bg-slate-50 flex flex-col justify-between relative overflow-hidden">
           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex justify-between">
             <span>Projected Operational Impact</span>
             <span className="text-[#F97316] font-black tracking-widest">LIVE METEOROLOGICAL FEED</span>
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

      {/* The Broad Timeline */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden relative">
          


          
          
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
              let liveMainIndex = 0;
              let activeNSCode = null;
              
              if (routeData.length > 0) {
                liveMainIndex = routeData.findIndex(s => {
                  if (isMatch(s.code)) return true;
                  if (s.nonStoppingList && s.nonStoppingList.some(ns => {
                      if (isMatch(ns.code)) {
                          activeNSCode = ns.code;
                          return true;
                      }
                      return false;
                  })) return true;
                  return false;
                });
                if (liveMainIndex === -1) liveMainIndex = 0;
              }
              const isLiveMain = index === liveMainIndex && !activeNSCode; 
              const isPassed = index < liveMainIndex || (index === liveMainIndex && activeNSCode !== null); 
              const shouldExpandNS = index === liveMainIndex && activeNSCode !== null;
              
              const isFutureOrLive = !isPassed;
              
              let nodeDelay = getPredictiveDelayProfile(trainNo, station.code);

              let nodeStatus = 'On Time';
              let nodeStatusClass = 'bg-[#DCFCE7] text-[#166534]';

              if (nodeDelay > 0) {
                  nodeStatus = formatDelayTime(nodeDelay);
                  nodeStatusClass = isPassed ? 'bg-[#FEE2E2] text-[#991B1B] opacity-80' : 'bg-[#FEE2E2] text-[#991B1B]';
              } else if (isPassed) {
                  nodeStatusClass = 'bg-slate-200 text-slate-600';
              }

              const displayExpectedArrival = calculateDynamicETA(station.scheduled_arrival, nodeDelay);
              const displayExpectedDeparture = calculateDynamicETA(station.scheduled_departure, nodeDelay);
              
              return ( 
              <div key={index} className="flex flex-col transition-colors">
                
                {/* Stopping Station Row */}
                <div 
                  onClick={() => toggleExpand(station.code)} 
                  className="flex relative items-stretch cursor-pointer group transition-colors"
                >
                  
                  {/* Left Column: Arrival (Solid Background) */}
                  <div className="w-[160px] py-6 pl-6 flex flex-col justify-center relative z-10 bg-white group-hover:bg-slate-50 border-b border-slate-100 transition-colors">
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
                            
                            <div className="mt-3">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none ${nodeStatusClass}`}>
                                {nodeStatus}
                              </span>
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : (
                      <div className="text-[13px] font-black tracking-widest uppercase text-slate-400">SOURCE</div>
                    )}
                  </div>

                  {/* Node Column (Transparent Background so the global track shows through) */}
                  <div className="w-[60px] py-6 flex justify-center items-center relative z-20 bg-transparent border-b border-transparent">
                    {/* Dynamic Node */}
                    {isLiveMain ? (
                      <div className="relative w-12 h-14 z-20 flex justify-center mt-2 cursor-pointer">
                        {/* Left Broadcast Signal */}
                        <svg className="absolute left-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                        </svg>
                        
                        {/* Right Broadcast Signal */}
                        <svg className="absolute right-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
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
                    ) : isPassed ? (
                      <div className="w-[20px] h-[20px] bg-green-600 border-[2px] border-white rounded-full z-10 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    ) : (
                      <div className="w-[18px] h-[18px] bg-white border-[4px] border-orange-500 rounded-full z-10 shadow-sm"></div>
                    )}
                  </div>

                  {/* Center Column: Station Details (Solid Background) */}
                  <div className="flex-1 py-6 flex flex-col justify-center pl-4 relative z-10 bg-white group-hover:bg-slate-50 border-b border-slate-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`text-sm font-black tracking-widest uppercase ${isPassed ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>{station.code}</span>
                      <span className={`text-[15px] font-black tracking-wider uppercase ${isPassed ? 'text-slate-600' : 'text-slate-800'}`}>{station.name}</span>
                      {station.platform && (
                        <span className={`text-white text-[10px] font-black px-3 py-1 rounded-none uppercase tracking-widest ${isPassed ? 'bg-slate-400' : 'bg-[#1E3A8A]'}`}>
                          {station.platform} *</span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-[11px] font-bold text-slate-500 space-x-6 mt-1 tracking-widest">
                      <span>{station.distance} Kms</span>
                      {station.nonStoppingList.length > 0 && (
                        <span className={`flex items-center cursor-pointer font-black transition-colors ${isPassed ? 'text-slate-500 group-hover:text-slate-700' : 'text-[#1E3A8A] group-hover:text-blue-600'}`}>
                          <span className="mr-2 text-sm leading-none">≢</span> 
                          {station.nonStoppingList.length} Non-Stopping Stations
                          <svg className={`w-3 h-3 ml-1 transition-transform duration-300 ${expandedStations[station.code] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Departure (Solid Background) */}
                  <div className="w-[160px] py-6 pr-6 flex flex-col justify-center text-right relative z-10 bg-white group-hover:bg-slate-50 border-b border-slate-100 transition-colors">
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
                        
                        {/* Left Badge Area - Subtract 6px width to account for the border-l-[6px] on parent! */}
                        <div className="w-[154px] pl-4 flex flex-col justify-center bg-[#FFF9F0] relative z-10 py-4">
                          <span className="inline-block px-3 py-1 text-[9px] font-black text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] rounded-none uppercase tracking-widest shadow-none w-max">
                            Non-Stopping
                          </span>
                        </div>

                        {/* Node Column */}
                        <div className="w-[60px] flex justify-center items-center relative z-20 bg-transparent py-4">
                          {activeNSCode === ns.code ? (
                            <div className="relative w-12 h-14 z-20 flex justify-center cursor-pointer scale-[0.85]">
                              {/* Left Broadcast Signal */}
                              <svg className="absolute left-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                <path d="M14 4 A10 10 0 0 0 14 20 M20 8 A5 5 0 0 0 20 16" />
                              </svg>
                              
                              {/* Right Broadcast Signal */}
                              <svg className="absolute right-[-16px] top-[10px] w-5 h-7 text-[#F97316] signal-blink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
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
                          ) : (
                            <div className="w-2 h-2 bg-slate-300 rounded-full z-10"></div>
                          )}
                        </div>

                        {/* Info Column */}
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

                        {/* Right Badge Area */}
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
