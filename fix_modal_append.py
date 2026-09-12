import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

modal_content = """
      {/* Conflict Modal Overlay */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="bg-red-50 border-b border-red-100 p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  <h3 className="text-lg font-black text-red-700 tracking-tight">Critical Operational Conflict</h3>
                </div>
                <p className="text-sm font-medium text-red-600/80 ml-5">Route / Section Conflict Detected at Nagpur Junction (NGP)</p>
              </div>
              <button 
                onClick={() => setIsConflictModalOpen(false)}
                className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/50">
              
              {/* Trains */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-md shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Affected Train</div>
                  <div className="text-base font-bold text-slate-800 mb-1">12626 Kerala Express</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-semibold text-slate-500">ETA: 13:45</span>
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-sm border border-red-200">+120m Delay</span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-md shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conflicting Train</div>
                  <div className="text-base font-bold text-slate-800 mb-1">12621 Tamil Nadu Express</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm font-semibold text-slate-500">ETA: 13:45</span>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-sm border border-emerald-200">On Time</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Conflict Window</div>
                  <div className="text-sm font-bold text-slate-700">13:45 – 13:52</div>
                </div>
                <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Affected Route</div>
                  <div className="text-sm font-bold text-slate-700">NGP Approach</div>
                </div>
                <div className="bg-white p-3 border border-slate-200 rounded-md shadow-sm">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Confidence</div>
                  <div className="text-sm font-bold text-blue-600">94% Verification</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-md p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1E3A8A]"></div>
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                  <span className="text-sm font-bold text-[#1E3A8A]">AI Recommendation</span>
                </div>
                
                <h4 className="text-base font-bold text-slate-800 mb-2">Regulate 12626 at Approach Signal</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Hold 12626 before the conflicting movement until 12621 clears the route. Expected impact: <span className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-sm border border-orange-100">+5–10 min delay</span>
                </p>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsConflictModalOpen(false)}
                    className="flex-1 bg-[#1E3A8A] text-white text-sm font-bold py-3 rounded-md shadow-md hover:bg-blue-900 transition-colors flex items-center justify-center">
                    Review & Approve Sequence
                  </button>
                  <button 
                    onClick={() => setIsConflictModalOpen(false)}
                    className="flex-1 bg-white border border-slate-300 text-slate-700 text-sm font-bold py-3 rounded-md shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center">
                    Reject / Manual Override
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700">
                  More Operational Options
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                    <span className="group-hover:text-[#1E3A8A] transition-colors">Resequence Movement</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                  <div className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                    <span className="flex items-center group-hover:text-[#1E3A8A] transition-colors">
                      Check Alternate Route/Line
                      <span className="ml-3 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-100">Check Required</span>
                    </span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                  <div className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                    <span className="group-hover:text-[#1E3A8A] transition-colors">Adjust Arrival Sequence</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                  <div className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                    <span className="group-hover:text-[#1E3A8A] transition-colors">Continue & Monitor</span>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
"""

code = code.replace("    </div>\n  );\n};\n", modal_content)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
