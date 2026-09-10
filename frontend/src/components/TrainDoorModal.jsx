import React, { useState, useEffect } from 'react';

const TrainDoorModal = ({ isOpen, onClose, title, content }) => {
  const [doorState, setDoorState] = useState('closed'); // 'closed', 'opening', 'open', 'closing'
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setDoorState('closed');
      document.body.style.overflow = 'hidden'; // Lock background scroll
      
      const timer = setTimeout(() => {
        setDoorState('opening');
      }, 100);
      return () => {
        clearTimeout(timer);
        // Fallback cleanup if component unmounts unexpectedly
        document.body.style.overflow = 'unset'; 
      };
    } else if (shouldRender) {
      setDoorState('closing');
      document.body.style.overflow = 'unset'; // Unlock background scroll
      
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    }
    
    // Always ensure we clean up if the effect re-runs or unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const isDoorClosed = doorState === 'closed' || doorState === 'closing';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background Overlay (Inside the train/modal) */}
      <div 
        className={`absolute inset-0 bg-white transition-opacity duration-300 ${doorState === 'opening' ? 'opacity-100' : 'opacity-0'} overflow-y-auto`}
      >
        {/* Top Official Header */}
        <div className="w-full bg-[#1E3A8A] border-l-8 border-[#F97316] text-white py-3 pl-4 pr-8 flex justify-between items-center shadow-md sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <img src="/favicon.png" alt="Emblem" className="h-6 w-6 opacity-90" />
            <span className="text-sm font-bold tracking-[0.15em] uppercase opacity-95">{title}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-[#F97316] transition-colors flex items-center text-xs font-bold tracking-widest uppercase"
          >
            Close 
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-w-6xl mx-auto mt-4 p-4 md:px-8 md:py-6 animate-fade-in-up">
          {content}
        </div>
      </div>

      {/* LEFT DOOR */}
      <div 
        className={`absolute top-0 left-0 h-full w-1/2 bg-slate-50 border-r-2 border-slate-300 shadow-2xl transition-transform duration-700 ease-in-out z-10 flex flex-col justify-center ${isDoorClosed ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Vande Bharat Stripes */}
        <div className="w-full h-8 bg-[#1E3A8A] mb-2 shadow-inner"></div>
        <div className="w-full h-3 bg-[#F97316] shadow-inner"></div>
        
        {/* Door Window */}
        <div className="absolute top-1/4 right-8 w-2/3 h-1/3 bg-slate-800 rounded-lg border-4 border-slate-300 opacity-90 shadow-inner flex items-center justify-end pr-4">
           {/* Reflection effect */}
           <div className="w-16 h-full bg-white opacity-5 skew-x-12"></div>
        </div>

        {/* Door seal / handle */}
        <div className="absolute right-0 top-1/2 w-1.5 h-32 bg-slate-400 rounded-l-md transform -translate-y-1/2 shadow-md"></div>
      </div>

      {/* RIGHT DOOR */}
      <div 
        className={`absolute top-0 right-0 h-full w-1/2 bg-slate-50 border-l-2 border-slate-300 shadow-2xl transition-transform duration-700 ease-in-out z-10 flex flex-col justify-center ${isDoorClosed ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Vande Bharat Stripes */}
        <div className="w-full h-8 bg-[#1E3A8A] mb-2 shadow-inner"></div>
        <div className="w-full h-3 bg-[#F97316] shadow-inner"></div>
        
        {/* Door Window */}
        <div className="absolute top-1/4 left-8 w-2/3 h-1/3 bg-slate-800 rounded-lg border-4 border-slate-300 opacity-90 shadow-inner flex items-center justify-start pl-4">
           {/* Reflection effect */}
           <div className="w-16 h-full bg-white opacity-5 skew-x-12"></div>
        </div>

        {/* Door seal / handle */}
        <div className="absolute left-0 top-1/2 w-1.5 h-32 bg-slate-400 rounded-r-md transform -translate-y-1/2 shadow-md"></div>
      </div>
    </div>
  );
};

export default TrainDoorModal;
