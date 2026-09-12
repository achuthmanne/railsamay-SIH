import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"\{\/\* Recommendation \*\/\}.*?(?=\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>\n\s*\);\n\};)"

replacement = """{/* AI Sequences Section */}
              <div className="pt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  <h4 className="text-base font-black text-slate-800 tracking-tight">AI-Evaluated Movement Sequences</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Recommended Sequence */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-md p-4 relative overflow-hidden shadow-sm flex flex-col hover:border-blue-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#1E3A8A]"></div>
                    <div className="flex justify-between items-center mb-4 mt-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-[#1E3A8A] text-white px-2 py-0.5 rounded-sm">Recommended</span>
                    </div>
                    <div className="text-lg font-black text-slate-800 mb-1 flex items-center space-x-2">
                      <span className="text-emerald-600">12621 First</span> 
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg> 
                      <span className="text-slate-600">12626</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-5">
                      Expected network impact: <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded-sm border border-slate-200">+6 min</span>
                    </p>
                    <div className="mt-auto">
                      <button onClick={() => setIsConflictModalOpen(false)} className="w-full bg-[#1E3A8A] text-white text-sm font-bold py-3 rounded-md shadow-sm hover:bg-blue-900 transition-colors flex items-center justify-center">
                        Approve Sequence
                      </button>
                    </div>
                  </div>
          
                  {/* Alternative Sequence */}
                  <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm flex flex-col hover:border-orange-300 transition-colors">
                    <div className="flex justify-between items-center mb-4 mt-1">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm border border-slate-200">Alternative</span>
                    </div>
                    <div className="text-lg font-black text-slate-800 mb-1 flex items-center space-x-2">
                      <span className="text-orange-600">12626 First</span> 
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg> 
                      <span className="text-slate-600">12621</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-5">
                      Expected network impact: <span className="font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-sm border border-orange-200">+9 min</span>
                    </p>
                    <div className="mt-auto">
                      <button onClick={() => setIsConflictModalOpen(false)} className="w-full bg-white border border-slate-300 text-slate-700 text-sm font-bold py-3 rounded-md shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center">
                        Select Alternative
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700">
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
                      <div key={idx} className="px-5 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors group">
                        <span className="group-hover:text-[#1E3A8A] transition-colors">{option}</span>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)
with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
