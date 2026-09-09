import React, { useState, useEffect } from 'react';

const LiveEcosystem = () => {
  const [speed, setSpeed] = useState(112);
  const [mode, setMode] = useState('day'); // 'day', 'rain', 'night'

  // Dynamic Speed Simulator
  useEffect(() => {
    const interval = setInterval(() => {
      let baseSpeed = 108;
      let maxSpeed = 116;
      if (mode === 'rain') { baseSpeed = 65; maxSpeed = 72; }
      else if (mode === 'night') { baseSpeed = 45; maxSpeed = 50; } // Wildlife/Night restriction
      
      setSpeed(Math.floor(Math.random() * (maxSpeed - baseSpeed + 1) + baseSpeed));
    }, 1500);
    return () => clearInterval(interval);
  }, [mode]);

  const cycleMode = () => {
    if (mode === 'day') setMode('rain');
    else if (mode === 'rain') setMode('night');
    else setMode('day');
  };

  // Derived styling based on mode
  const bgColors = {
    day: 'bg-[#e0f2fe]',
    rain: 'bg-[#475569]',
    night: 'bg-[#0f172a]'
  };

  // Official Railway Terminology for ETA & Status
  let etaTime = "14:30";
  let statusText = "Section Clearance: Normal";
  let statusBg = "bg-emerald-50 border-emerald-500";
  let statusTextColor = "text-emerald-700";
  let reasonText = "Clear sky and optimal track conditions. Proceeding at maximum permissible speed (MPS).";

  if (mode === 'rain') {
    etaTime = "14:55";
    statusText = "Caution Order: Heavy Rain";
    statusBg = "bg-amber-50 border-amber-500";
    statusTextColor = "text-amber-700";
    reasonText = "Monsoon protocol active. Reduced speed mandated by section controller due to heavy rainfall.";
  } else if (mode === 'night') {
    etaTime = "15:15";
    statusText = "Speed Restriction: Dense Fog";
    statusBg = "bg-rose-50 border-rose-500";
    statusTextColor = "text-rose-700";
    reasonText = "Extremely low visibility due to dense fog and night conditions. Speed restricted to 45 km/h for safety.";
  }

  return (
    <div className="w-full relative pb-20 bg-white">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 pt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-montserrat font-extrabold text-[#1E3A8A] uppercase tracking-wide">Real-Time AI Telemetry Simulation</h2>
          <div className="w-20 h-1.5 bg-[#F97316] mx-auto mt-4"></div>
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto font-inter text-lg">
            Dynamic environment rendering powered by the Rail Samay ETA Engine.
          </p>
        </div>
        
        {/* Mode Trigger Button */}
        <div className="flex justify-center">
          <button 
            onClick={cycleMode}
            className={`px-8 py-3.5 rounded-sm font-bold text-sm uppercase tracking-widest transition-colors flex items-center ${
              mode === 'day' ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 
              mode === 'rain' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 
              'bg-[#0f172a] hover:bg-slate-900 text-white'
            }`}
          >
            {mode === 'day' && <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg> Simulate Storm</>}
            {mode === 'rain' && <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> Simulate Foggy Night</>}
            {mode === 'night' && <><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Restore Clear Sky</>}
          </button>
        </div>
      </div>

      {/* Ecosystem Canvas */}
      <div className={`relative w-full h-[600px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] border-y-4 border-[#1E3A8A] transition-colors duration-[3000ms] ease-in-out ${bgColors[mode]}`}>
        
        {/* CSS ANIMATIONS */}
        <style>{`
          @keyframes slideRightSlow { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
          @keyframes slideRightMed { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
          @keyframes slideRightFast { 0% { transform: translateX(-100vw); } 100% { transform: translateX(100vw); } }
          @keyframes slideRightTrack { 0% { background-position: -40px 0; } 100% { background-position: 0 0; } }
          @keyframes trainBounce { 0% { transform: translateY(0); } 100% { transform: translateY(1.5px); } }
          @keyframes heavyRainFall { 0% { background-position: 0px 0px; } 100% { background-position: -400px 400px; } }
          @keyframes fogDrift { 0% { background-position: 0 0; } 100% { background-position: 1000px 0; } }
          @keyframes boardSwing { 0% { transform: rotate(-1.5deg); } 100% { transform: rotate(1.5deg); } }
        `}</style>

        {/* --- OFFICIAL HANGING ETA BOARD (WHITE BG + WATERMARK) --- */}
        <div className="absolute top-0 right-10 z-40 flex flex-col items-center origin-top pointer-events-none">
          
          {/* Chains */}
          <div className="flex w-[60%] justify-between">
            <div className="w-1.5 h-8 bg-slate-300" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, #94a3b8 3px, #94a3b8 6px)' }}></div>
            <div className="w-1.5 h-8 bg-slate-300" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, #94a3b8 3px, #94a3b8 6px)' }}></div>
          </div>
          
          {/* Main White Board */}
          <div className="bg-white shadow-2xl w-[360px] rounded-sm font-inter flex flex-col relative z-10 overflow-hidden">
            
            {/* Background Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0 mt-6">
               <img src="/favicon.png" alt="Watermark" className="w-48 h-48 object-contain" />
            </div>
            
            {/* Header: Rail Samay ETA */}
            <div className="bg-[#1E3A8A] text-white px-4 py-2 flex items-center justify-center relative z-10 shadow-sm border-b-4 border-[#F97316]">
               <span className="font-montserrat font-bold text-sm tracking-wide">Rail Samay ETA</span>
            </div>

            {/* Board Content Over Watermark */}
            <div className="p-4 relative z-10">
               {/* Station Row */}
               <div className="mb-2.5 flex justify-between items-end border-b border-slate-200 pb-2">
                  <div>
                     <div className="text-slate-500 text-xs font-semibold mb-1">Next Station</div>
                     <div className="text-[#1E3A8A] font-montserrat font-black text-xl leading-none">
                       Nagpur <span className="text-[#F97316] font-semibold text-sm ml-1">(NGP)</span>
                     </div>
                  </div>
               </div>
               
               {/* Speed and ETA Row */}
               <div className="grid grid-cols-2 gap-4 mb-2.5">
                  <div>
                     <div className="text-slate-500 text-xs font-semibold mb-1">Current Speed</div>
                     <div className="text-slate-800 font-bold text-3xl font-mono leading-none tracking-tight">
                       {speed}<span className="text-sm text-slate-500 font-medium tracking-normal ml-1">km/h</span>
                     </div>
                  </div>
                  <div>
                     <div className="text-slate-500 text-xs font-semibold mb-1">Target ETA</div>
                     <div className="text-slate-800 font-bold text-3xl font-mono leading-none tracking-tight">
                       {etaTime}
                     </div>
                  </div>
               </div>

               {/* Status Reason Box */}
               <div className={`p-2.5 rounded-md border-l-4 ${statusBg}`}>
                  <div className={`text-sm font-bold mb-0.5 ${statusTextColor}`}>
                    {statusText}
                  </div>
                  <div className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    {reasonText}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 1. SUN */}
        <div className={`absolute top-12 left-[15%] w-24 h-24 bg-yellow-100 rounded-full blur-[4px] transition-opacity duration-[3000ms] ${mode === 'day' ? 'opacity-80' : 'opacity-0'}`}></div>

        {/* 2. DAY SCENERY */}
        <div 
          className={`absolute bottom-[80px] left-0 h-[400px] w-max flex mix-blend-multiply transition-opacity duration-[3000ms] ${mode !== 'night' ? 'opacity-80' : 'opacity-0'}`}
          style={{ animation: 'slideRightSlow 50s linear infinite' }}
        >
          {[...Array(16)].map((_, i) => (
            <img key={`day-${i}`} src="/scenery.png" className={`h-full w-auto object-cover flex-shrink-0 -ml-[1px] ${i % 2 === 0 ? 'scale-x-[-1]' : ''}`} alt="scenery" />
          ))}
        </div>

        {/* 3. NIGHT SCENERY */}
        <div 
          className={`absolute bottom-[80px] left-0 h-[400px] w-max flex mix-blend-multiply transition-opacity duration-[3000ms] ${mode === 'night' ? 'opacity-90' : 'opacity-0'}`}
          style={{ animation: 'slideRightSlow 50s linear infinite' }}
        >
          {[...Array(16)].map((_, i) => (
            <img key={`night-${i}`} src="/scenery-night.png" className={`h-full w-auto object-cover flex-shrink-0 -ml-[1px] ${i % 2 === 0 ? 'scale-x-[-1]' : ''}`} alt="night-scenery" />
          ))}
        </div>

        {/* 4. POLES & WIRE */}
        <div 
          className={`absolute bottom-[35px] left-0 w-[200%] h-[260px] mix-blend-multiply transition-opacity duration-[3000ms] ${mode === 'night' ? 'opacity-60' : 'opacity-100'}`}
          style={{ animation: 'slideRightMed 6s linear infinite' }}
        >
          <div className="absolute top-[50px] w-full h-[2px] bg-gray-400"></div>
          <div className="flex justify-around w-full h-full px-[5%]">
            {[...Array(5)].map((_, i) => (
              <img key={`pole-${i}`} src="/pole.png" className="h-full object-contain opacity-90" alt="Electric Pole" />
            ))}
          </div>
        </div>

        {/* 5. STATION BOARD */}
        <div className="absolute bottom-[80px] left-[-200px] h-[220px] mix-blend-multiply" style={{ animation: 'slideRightFast 15s linear infinite 5s' }}>
          <div className="relative h-full flex items-center justify-center">
            <img src="/station-board.png" className="h-full object-contain" alt="Station Board" />
            <div className={`absolute w-full text-center font-bold text-2xl font-montserrat -mt-[88px] tracking-widest ${mode === 'night' ? 'text-slate-700' : 'text-slate-900'}`}>
              VIJAYAWADA
            </div>
          </div>
        </div>

        {/* 6. THE TRAIN (CROSSFADE SYSTEM) */}
        <div className="absolute bottom-[80px] left-[5%] lg:left-[15%] h-[200px]" style={{ animation: 'trainBounce 0.2s infinite alternate' }}>
           <div className="relative h-full flex items-end">
               
               {/* DAY TRAIN LAYER */}
               <div className={`flex items-end h-full transition-opacity duration-[2000ms] ${mode !== 'night' ? 'opacity-100' : 'opacity-0'}`}>
                   <img src="/engine.png" className="h-[105%] mix-blend-multiply object-contain relative z-10 translate-y-[26px]" alt="Engine" />
                   <img src="/coach.png" className="h-[95%] mix-blend-multiply object-contain -ml-[4px] translate-y-[33px]" alt="Coach 1" />
                   <img src="/coach.png" className="h-[95%] mix-blend-multiply object-contain -ml-[4px] translate-y-[33px]" alt="Coach 2" />
                   <img src="/coach.png" className="h-[95%] mix-blend-multiply object-contain -ml-[4px] translate-y-[33px]" alt="Coach 3" />
               </div>

               {/* NIGHT TRAIN LAYER */}
               <div className={`absolute top-0 left-0 flex items-end h-full transition-opacity duration-[2000ms] ${mode === 'night' ? 'opacity-100' : 'opacity-0'}`}>
                   <img 
                     src="/engine-night.png" 
                     className="h-[105%] mix-blend-multiply object-contain relative z-10 translate-y-[35px]" 
                     alt="Engine Night" 
                     style={{ 
                       WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 98.5%, transparent 100%)',
                       maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 98.5%, transparent 100%)'
                     }}
                   />
                   <img src="/coach-night.png" className="h-[95%] mix-blend-multiply object-contain -ml-[10px] translate-y-[33px]" alt="Coach 1 Night" />
                   <img src="/coach-night.png" className="h-[95%] mix-blend-multiply object-contain -ml-[10px] translate-y-[33px]" alt="Coach 2 Night" />
                   <img src="/coach-night.png" className="h-[95%] mix-blend-multiply object-contain -ml-[10px] translate-y-[33px]" alt="Coach 3 Night" />
               </div>

           </div>
        </div>

        {/* 7. TRACK GROUND */}
        <div className="absolute bottom-0 w-full h-[80px] bg-slate-800 border-t-[3px] border-[#F97316]">
           <div 
              className="w-[200%] h-full opacity-40 blur-[1px]" 
              style={{ backgroundImage: "repeating-linear-gradient(90deg, #1e293b, #1e293b 20px, #0f172a 20px, #0f172a 40px)", animation: `${mode === 'day' ? 'slideRightTrack 0.5s' : mode === 'rain' ? 'slideRightTrack 0.8s' : 'slideRightTrack 1.2s'} linear infinite` }}
           ></div>
        </div>

        {/* 8. FOREGROUND SIGNALS */}
        <div className={`absolute bottom-[-30px] left-[-200px] h-[320px] mix-blend-multiply transition-opacity duration-[3000ms] ${mode === 'night' ? 'opacity-50' : 'opacity-100'}`} style={{ animation: 'slideRightFast 3.5s linear infinite 2s' }}>
            <img src="/foreground.png" className="h-full object-contain" alt="Railway Signal" />
        </div>

        {/* 9. ANIMATED RAIN OVERLAY */}
        <div className={`absolute top-[100px] bottom-0 left-0 w-full mix-blend-multiply pointer-events-none transition-opacity duration-[2000ms] ${mode === 'rain' ? 'opacity-70' : 'opacity-0'}`}>
          <div className="w-full h-full bg-repeat opacity-80" style={{ backgroundImage: "url('/rain.png')", animation: 'heavyRainFall 0.4s linear infinite', backgroundSize: '400px' }}></div>
        </div>

        {/* 10. DARK STORM CLOUDS */}
        <div 
          className={`absolute top-[-20px] left-0 h-[220px] w-max flex mix-blend-multiply transition-opacity duration-[3000ms] ease-in-out ${mode === 'rain' ? 'opacity-90' : 'opacity-0'}`}
          style={{ animation: 'slideRightSlow 60s linear infinite', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
        >
          {[...Array(16)].map((_, i) => (
            <img key={`cloud-${i}`} src="/clouds.png" className={`h-full w-auto object-cover flex-shrink-0 -ml-[1px] ${i % 2 === 0 ? 'scale-x-[-1]' : ''}`} alt="clouds" />
          ))}
        </div>

        {/* 11. NIGHT FOG OVERLAY (CSS Magic: Invert + Screen) */}
        <div className={`absolute bottom-[20px] left-0 w-[200%] h-[300px] mix-blend-screen pointer-events-none transition-opacity duration-[4000ms] blur-[3px] ${mode === 'night' ? 'opacity-40' : 'opacity-0'}`}>
          <div className="w-full h-full bg-repeat-x opacity-80" style={{ backgroundImage: "url('/fog.png')", animation: 'slideRightSlow 40s linear infinite', filter: 'invert(1)', backgroundSize: 'auto 100%' }}></div>
        </div>

      </div>
    </div>
  );
};

export default LiveEcosystem;
