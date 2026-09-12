import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make the modal overlay super high z-index to cover the map and its z-[500] legend
target = r"className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in\""
replacement = r'className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"'

code = re.sub(target, replacement, code)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
