import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"<div className=\"bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden\">\s*<div className=\"bg-red-50/80 border-b border-red-100 p-4\">.*?<\/div>\s*<\/div>"

replacement = """<div className="bg-white border-y border-r border-slate-200 border-l-4 border-l-red-600 shadow-sm flex flex-col p-4 rounded-none hover:bg-slate-50 transition-colors">
                              <div className="flex items-center mb-1.5">
                                <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Critical Operational Conflict</h3>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 ml-6 mb-4">
                                Route / Section Conflict Detected at Nagpur Junction (NGP)
                              </p>
                              
                              <button 
                                onClick={() => setIsConflictModalOpen(true)}
                                className="w-full bg-[#1E3A8A] text-white text-xs font-bold py-2.5 rounded-none shadow-sm hover:bg-blue-900 transition-colors flex items-center justify-center uppercase tracking-widest">
                                View Conflict Details
                                <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                              </button>
                            </div>"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
