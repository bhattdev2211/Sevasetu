"""
Root launcher for SevaSetu Python web application.
Enables running the application directly from the project root:
    python app.py
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PY_APP_DIR = os.path.join(BASE_DIR, 'sevasetu_python')

if PY_APP_DIR not in sys.path:
    sys.path.insert(0, PY_APP_DIR)

# Switch working directory to sevasetu_python for relative static/template paths
os.chdir(PY_APP_DIR)

from app import main

if __name__ == '__main__':
    main()

