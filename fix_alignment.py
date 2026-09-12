import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"<div className=\"flex items-center mb-1\.5\">\s*<svg.*?<\/svg>\s*<h3 className=\"text-sm font-black text-slate-900 tracking-tight\">Critical Operational Conflict<\/h3>\s*<\/div>"

replacement = """<div className="flex items-center mb-1.5">
                                <svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 animate-pulse" style={{ marginTop: '-1px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h3 className="text-[13px] font-bold text-slate-800 leading-none">Critical Operational Conflict</h3>
                              </div>"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
