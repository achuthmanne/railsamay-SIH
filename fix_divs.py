import re

with open('frontend/src/pages/ATSDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = """              </div>
        </div>
      )}
    </div>"""

replacement = """              </div>
            </div>
          </div>
        </div>
      )}
    </div>"""

code = code.replace(target, replacement)

with open('frontend/src/pages/ATSDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
