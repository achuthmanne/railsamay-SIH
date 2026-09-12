import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

pattern = r"<svg className=\"w-4 h-4 text-red-600 mr-2 flex-shrink-0 animate-pulse\" style=\{\{ marginTop: '-1px' \}\} fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">"

replacement = r'<svg className="w-4 h-4 text-red-600 mr-2 flex-shrink-0 animate-pulse mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">'

code = re.sub(pattern, replacement, code)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
