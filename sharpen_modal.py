import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"\{\/\* Conflict Modal Overlay \*\/\}.*?(?=\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\);\n\};)"

replacement = """{/* Conflict Modal Overlay */}
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
                  <p className="text-sm font-medium text-slate-500">Route / Section Conflict Detected at Nagpur Junction (NGP)</p>
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
              <div className="grid grid-cols-3 gap-0 border border-slate-200 rounded-none bg-slate-50">
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Window</div>
                  <div className="text-xs font-bold text-slate-800">13:45 – 13:52</div>
                </div>
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Affected Route</div>
                  <div className="text-xs font-bold text-slate-800">NGP Approach</div>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Confidence</div>
                  <div className="text-xs font-bold text-blue-700 flex items-center">
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
                      Network Impact: <span className="font-bold text-slate-900 bg-slate-100 px-1 py-0.5 rounded-none">+6 min</span>
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
                      Network Impact: <span className="font-bold text-orange-800 bg-orange-50 px-1 py-0.5 border border-orange-200 rounded-none">+9 min</span>
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
              </div>"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
