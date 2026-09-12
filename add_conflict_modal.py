import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add State
state_target = r"const \[isLoading, setIsLoading\] = useState\(true\);"
state_replacement = "const [isLoading, setIsLoading] = useState(true);\n  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);"
code = re.sub(state_target, state_replacement, code)

# 2. Minimize Sidebar Card
card_pattern = r"(<div className=\"bg-white border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden\">\s*\{\/\* Header Area \*\/\}.*?)(?=\n\s*\) : \()"

minimized_card = """<div className="bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                              <div className="bg-red-50/80 border-b border-red-100 p-4">
                                <div className="flex items-center space-x-2 mb-1">
                                  <svg className="w-4 h-4 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                  <h3 className="text-sm font-bold text-red-700">Critical Operational Conflict</h3>
                                </div>
                                <p className="text-xs font-medium text-red-600/80 ml-6 mb-4">Route / Section Conflict Detected at Nagpur Junction (NGP)</p>
                                
                                <button 
                                  onClick={() => setIsConflictModalOpen(true)}
                                  className="w-full bg-white border border-red-200 text-red-700 text-xs font-bold py-2 rounded-sm shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center">
                                  View Conflict Details
                                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                              </div>
                            </div>"""

# Keep the original detailed card string to put it in the modal
original_card_match = re.search(card_pattern, code, flags=re.DOTALL)
original_card = original_card_match.group(1) if original_card_match else ""

code = re.sub(card_pattern, minimized_card, code, flags=re.DOTALL)


# 3. Append Modal
# We will construct a beautiful full-screen modal wrapping the `original_card` (or slightly modified version of it)
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
                  Hold 12626 before the conflicting movement until 12621 clears the route. Expected impact: <span className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-sm">+5–10 min delay</span>.
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
"""

end_target = r"(\s*)(</div>\s*);\s*};\s*export default ATSDashboard;"
code = re.sub(end_target, r"\1" + modal_content + r"\n\1\2;\n};\n\nexport default ATSDashboard;", code)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

with open('frontend/src/index.css', 'a', encoding='utf-8') as f:
    f.write("\n@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }\n.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }\n.animate-slide-up { animation: slideUp 0.3s ease-out forwards; }\n")

