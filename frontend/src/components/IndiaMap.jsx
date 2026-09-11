import React from 'react';

// Simplified India Outline SVG
const IndiaMap = ({ children }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <svg 
        viewBox="0 0 400 450" 
        className="w-full h-full opacity-30 stroke-slate-400 fill-blue-50"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M 120 50 L 150 20 L 180 30 L 200 10 L 230 40 L 220 80 L 260 100 L 320 120 L 360 170 L 340 220 L 300 240 L 280 300 L 220 400 L 180 430 L 150 380 L 110 320 L 80 260 L 40 220 L 20 180 L 30 150 L 70 120 L 100 80 Z" strokeWidth="3" strokeLinejoin="round"/>
        {/* Simple interior lines representing major railway zones */}
        <path d="M 200 10 L 200 400" strokeWidth="1" strokeDasharray="5,5" />
        <path d="M 30 150 L 360 170" strokeWidth="1" strokeDasharray="5,5" />
        <path d="M 80 260 L 300 240" strokeWidth="1" strokeDasharray="5,5" />
      </svg>
      {/* Overlay nodes */}
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};
export default IndiaMap;
