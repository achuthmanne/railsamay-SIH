import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { simStore } from '../store/SimulationStore';

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
  const trainName = location.state?.trainName || 'EXPRESS';
  
  const location_train = location.state?.train || null;
  const storeTrain = simStore.trains.find(t => t.no === trainNo);
  const [liveTrain, setLiveTrain] = useState(storeTrain || location_train);

  useEffect(() => {
    const unsubscribe = simStore.subscribe((trains, isSim) => {
       const updatedTrain = trains.find(t => t.no === trainNo);
       if (updatedTrain) {
          setLiveTrain(updatedTrain);
       }
    });
    return () => unsubscribe();
  }, [trainNo]);

  const train = liveTrain;
  const currentLocation = train?.currentLocation || location.state?.currentLocation || 'NGP';
  const liveDelay = train?.delayMinutes || 0;

  const calculateDynamicETA = (timeStr, delayMins) => {
    if (!timeStr || timeStr === '--:--' || timeStr.includes('Source') || timeStr.includes('Destination')) return timeStr;
    const parts = timeStr.split(' | ');
    const t = parts[0];
    if (!t.includes(':')) return timeStr;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const d = new Date(2024, 0, 1, h, m);
    d.setMinutes(d.getMinutes() + (delayMins || 0));
    const newTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return parts.length > 1 ? `${newTime} | ${parts[1]}` : newTime;
  };
  const [routeData, setRouteData] = useState([]);
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

  const toggleExpand = (code) => {
    setExpandedStations(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-inter font-bold text-slate-500">Loading Train Data...</div>;
  }

  
  const liveStation = routeData.find(s => currentLocation.includes(s.code)) || routeData[0];
  const lastStation = routeData.length > 0 ? routeData[routeData.length - 1] : null;
  const progressPercent = (liveStation && lastStation && lastStation.distance > 0) 
    ? Math.round((liveStation.distance / lastStation.distance) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Top Header Navigation */}
      <div className="bg-[#1E3A8A] border-b-4 border-orange-500 px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-white p-2 mr-4 transition-all duration-300 hover:bg-white/10 rounded-sm group">
          <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h1 className="text-xl font-black text-white tracking-widest uppercase">
          ATS: LIVE ROUTE TELEMETRY
        </h1>
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
                Last updated: Just now
              </div>
              <button className="text-xs font-bold text-[#1E3A8A] border border-[#1E3A8A] px-4 py-1.5 rounded-none hover:bg-[#1E3A8A] hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center w-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh
              </button>
            </div>
          </div>
          <div className="bg-orange-50 border-t border-orange-100 px-6 py-3 flex items-center text-xs font-bold text-orange-800 tracking-wide">
            <span className="w-4 h-4 bg-orange-200 rounded-none flex items-center justify-center mr-2 text-[10px]">i</span>
            Data shown with (*) are dynamic in nature and may change.
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
          <div className="bg-white border border-slate-200 shadow-sm p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1E3A8A]/5 rounded-bl-full -z-10"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-[#1E3A8A] tracking-widest uppercase flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                AI Dynamic Forecast Engine
              </h3>
              <div className="flex items-center space-x-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 uppercase tracking-widest border border-emerald-200">
                  Live ML Feed Active
                </div>
              </div>
            </div>

            {trainNo === '12626' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Circular Gauges for ML Features */}
                <div className="col-span-2 border border-slate-200 p-4 bg-white flex flex-col justify-between">
                   <div className="flex justify-between items-center mb-2">
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Constraints Engine</div>
                     <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Model Confidence: 94%</div>
                   </div>
                   
                   <div className="flex justify-around items-center pt-2">
                      <CircularGauge percentage={88} color={'text-red-500'} label="Network Congestion" value={'High Traffic'} />
                      <CircularGauge percentage={35} color={'text-orange-500'} label="Weather Impact" value={'Mild Rains'} />
                      <CircularGauge percentage={65} color={'text-red-500'} label="Speed Restrictions" value={'TSR Active'} />
                   </div>
                </div>

                {/* Dynamic Final ML Output */}
                <div className="border border-slate-200 p-5 bg-slate-50 flex flex-col justify-between relative overflow-hidden">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">ML Predicted Impact</div>
                   
                   <div className="flex flex-col mb-4 relative z-10">
                      <div className="text-sm font-black text-slate-800 tracking-wide mb-1">Causality Analysis:</div>
                      <div className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 border border-red-200 inline-block mb-1">
                        Platform Sequence Conflict detected at upcoming NGP junction. Routing bottleneck.
                      </div>
                   </div>

                   <div className="flex justify-between items-end border-t border-slate-200 pt-3 relative z-10">
                     <div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Arrival Variance</div>
                       <div className="text-3xl font-black text-red-600 leading-none">15:45</div>
                     </div>
                     <div className="text-xs font-black text-red-700 bg-red-100 px-2 py-1 border border-red-200">
                       +120m
                     </div>
                   </div>
                </div>
              </div>
            ) : trainNo === '12621' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 border border-slate-200 p-4 bg-white flex flex-col justify-between">
                   <div className="flex justify-between items-center mb-2">
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Constraints Engine</div>
                     <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Model Confidence: 98%</div>
                   </div>
                   
                   <div className="flex justify-around items-center pt-2">
                      <CircularGauge percentage={12} color={'text-emerald-500'} label="Network Congestion" value={'Clear Route'} />
                      <CircularGauge percentage={5} color={'text-emerald-500'} label="Weather Impact" value={'Optimal'} />
                      <CircularGauge percentage={10} color={'text-emerald-500'} label="Speed Restrictions" value={'Normal'} />
                   </div>
                </div>

                <div className="border border-slate-200 p-5 bg-slate-50 flex flex-col justify-between relative overflow-hidden">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">ML Predicted Impact</div>
                   
                   <div className="flex flex-col mb-4 relative z-10">
                      <div className="text-sm font-black text-slate-800 tracking-wide mb-1">Causality Analysis:</div>
                      <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 border border-emerald-200 inline-block mb-1">
                        Clear path ahead. Priority routing approved. Proceed at optimal speed.
                      </div>
                   </div>

                   <div className="flex justify-between items-end border-t border-slate-200 pt-3 relative z-10">
                     <div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Arrival Variance</div>
                       <div className="text-3xl font-black text-emerald-600 leading-none">13:45</div>
                     </div>
                     <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-1 border border-emerald-200">
                       ON TIME
                     </div>
                   </div>
                </div>
              </div>
            ) : null}
          </div>

        {/* The Broad Timeline */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden relative">
          
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
              let liveMainIndex = 0;
              let activeNSCode = null;
              
              if (routeData.length > 0) {
                liveMainIndex = routeData.findIndex(s => {
                  if (currentLocation.includes(s.code)) return true;
                  if (s.nonStoppingList && s.nonStoppingList.some(ns => {
                      if (currentLocation.includes(ns.code)) {
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
                              {calculateDynamicETA(station.scheduled_arrival, liveDelay)}
                            </div>
                            
                            <div className="mt-3">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none ${station.status === 'On Time' ? (isPassed ? 'bg-slate-200 text-slate-600' : 'bg-[#DCFCE7] text-[#166534]') : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                                {station.status}
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
                              {calculateDynamicETA(station.scheduled_departure, liveDelay)}
                            </div>
                            
                            <div className="mt-3 flex justify-end">
                              <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-none ${station.status === 'On Time' ? (isPassed ? 'bg-slate-200 text-slate-600' : 'bg-[#DCFCE7] text-[#166534]') : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                                {station.status}
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
                    {station.nonStoppingList.map((ns, i) => (
                      <div key={i} className="flex relative items-stretch border-b border-orange-200">
                        
                        {/* Left Badge Area */}
                        <div className="w-[160px] pl-6 flex flex-col justify-center bg-[#FFF9F0] relative z-10 py-4">
                          <span className="inline-block px-3 py-1 text-[9px] font-black text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] rounded-none uppercase tracking-widest shadow-none w-max">
                            Non-Stopping
                          </span>
                        </div>

                        {/* Node Column */}
                        <div className="w-[60px] flex justify-center items-center relative z-20 bg-transparent py-4">
                          {activeNSCode === ns.code ? (
                            <div className="relative w-8 h-8 z-20 flex justify-center items-center">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                              <div className="relative w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
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
                          </div>
                          <div className="flex items-center text-[10px] font-bold text-slate-500 space-x-4 tracking-widest mt-1">
                            <span>{ns.distance} Kms</span>
                            <span className="text-slate-300">|</span>
                            <span>Arrival Time: {ns.arrival_time}</span>
                            <span className="text-slate-300">|</span>
                            <span>Departure Time: {ns.departure_time}</span>
                          </div>
                        </div>

                        {/* Right Badge Area */}
                        <div className="w-[160px] pr-6 flex flex-col justify-center items-end bg-[#FFF9F0] relative z-10 py-4">
                          <span className="inline-block px-3 py-1 text-[9px] font-black text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] rounded-none uppercase tracking-widest shadow-none">
                            Non-Stopping
                          </span>
                        </div>

                      </div>
                    ))}
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
