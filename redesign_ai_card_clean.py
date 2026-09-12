import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"(<div className=\"bg-white border border-slate-200 border-l-4 border-l-red-600 p-5 shadow-sm\">.*?)(?=\n\s*\) : \()"

replacement = """<div className="bg-white border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                            {/* Header Area */}
                            <div className="bg-red-50/80 border-b border-red-100 p-4">
                              <div className="flex items-center space-x-2 mb-1">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h3 className="text-sm font-bold text-red-700">Critical Operational Conflict</h3>
                              </div>
                              <p className="text-xs font-medium text-red-600/80 ml-6">Route / Section Conflict Detected at Nagpur Junction (NGP)</p>
                            </div>
                      
                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-5">
                              {/* Involved Trains */}
                              <div className="space-y-2.5">
                                <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-sm shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">12626 Kerala Express</span>
                                    <span className="text-xs text-slate-500 font-medium mt-0.5">ETA: 13:45</span>
                                  </div>
                                  <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded-sm border border-red-200">+120m Delay</span>
                                </div>
                                
                                <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-sm shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-800">12621 Tamil Nadu Express</span>
                                    <span className="text-xs text-slate-500 font-medium mt-0.5">ETA: 13:45</span>
                                  </div>
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-sm border border-emerald-200">On Time</span>
                                </div>
                              </div>
                      
                              {/* Telemetry Stats */}
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex flex-col p-3 border border-slate-100 bg-slate-50 rounded-sm">
                                  <span className="text-slate-500 font-medium mb-1">Conflict Window</span>
                                  <span className="font-bold text-slate-700">13:45 – 13:52</span>
                                </div>
                                <div className="flex flex-col p-3 border border-slate-100 bg-slate-50 rounded-sm">
                                  <span className="text-slate-500 font-medium mb-1">Affected Route</span>
                                  <span className="font-bold text-slate-700">NGP Approach</span>
                                </div>
                              </div>
                      
                              {/* AI Recommendation */}
                              <div className="bg-[#F8FAFC] border border-blue-100 rounded-sm p-4 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#1E3A8A]"></div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                                  <span className="text-xs font-bold text-[#1E3A8A]">AI Recommendation</span>
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 ml-auto border border-blue-200 rounded-sm">94% Confidence</span>
                                </div>
                                
                                <h4 className="text-sm font-bold text-slate-800 mb-1.5">Regulate 12626 at Approach Signal</h4>
                                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                  Hold 12626 before the conflicting movement until 12621 clears the route. Expected impact: <span className="font-bold text-orange-600">+5–10 min</span>
                                </p>
                      
                                <button className="w-full bg-[#1E3A8A] text-white text-xs font-bold py-2.5 rounded-sm shadow-sm hover:bg-blue-900 transition-colors flex items-center justify-center">
                                  Review & Approve Sequence
                                </button>
                              </div>
                      
                              {/* More Options */}
                              <details className="w-full group">
                                <summary className="w-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-sm hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer list-none shadow-sm">
                                  More Operational Options
                                  <svg className="w-4 h-4 ml-1.5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </summary>
                                <div className="mt-2 border border-slate-200 bg-white shadow-sm rounded-sm overflow-hidden">
                                  <div className="px-3 py-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors">
                                    Resequence Movement
                                  </div>
                                  <div className="px-3 py-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors">
                                    Check Alternate Route/Line
                                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-sm border border-orange-100">Check Req</span>
                                  </div>
                                  <div className="px-3 py-2.5 text-xs font-semibold text-slate-600 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors">
                                    Adjust Arrival Sequence
                                  </div>
                                  <div className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors">
                                    Continue & Monitor
                                  </div>
                                </div>
                              </details>
                            </div>
                          </div>"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
