import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Fix Modal Stats
stats_pattern = r"\{\/\* Stats \*\/\}\s*<div className=\"grid grid-cols-3 gap-0 border border-slate-200 rounded-none bg-slate-50\">.*?<\/div>\s*<\/div>\s*<\/div>"
stats_replacement = """{/* Stats */}
              <div className="grid grid-cols-4 gap-0 border border-slate-200 rounded-none bg-slate-50">
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Window</div>
                  <div className="text-xs font-bold text-slate-800">13:45 – 13:52</div>
                </div>
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Point</div>
                  <div className="text-xs font-bold text-slate-800">Yard Crossover 44B</div>
                </div>
                <div className="p-3 border-r border-slate-200 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conflict Type</div>
                  <div className="text-[11px] font-bold text-red-600">Surface Crossing</div>
                </div>
                <div className="p-3 bg-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Confidence</div>
                  <div className="text-xs font-bold text-blue-700 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                    94% Validated
                  </div>
                </div>
              </div>"""

code = re.sub(stats_pattern, stats_replacement, code, flags=re.DOTALL)

# 2. Fix the subtitles from generic 'Route / Section Conflict' to 'Surface Crossover Interlocking Conflict'
code = code.replace(
    'Route / Section Conflict Detected at Nagpur Junction (NGP)',
    'Surface Crossover Interlocking Conflict at NGP Yard Throat'
)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
