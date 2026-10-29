"""
Root launcher & WSGI entry point for SevaSetu Python web application.
Enables running the application directly from the project root:
    python app.py
Or via Gunicorn:
    gunicorn app:app
    gunicorn wsgi:app
"""

import os
import sys
import importlib.util

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PY_APP_DIR = os.path.join(BASE_DIR, 'sevasetu_python')

if PY_APP_DIR not in sys.path:
    sys.path.insert(0, PY_APP_DIR)

# Switch working directory to sevasetu_python for relative static/template paths
os.chdir(PY_APP_DIR)

# Expose WSGI application for servers like Gunicorn (gunicorn app:app)
try:
    from flask_app import app
    application = app
except Exception:
    app = None
    application = None

def run_main():
    inner_app_path = os.path.join(PY_APP_DIR, 'app.py')
    spec = importlib.util.spec_from_file_location("sevasetu_python_app", inner_app_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if hasattr(module, 'main'):
        module.main()

if __name__ == '__main__':
    run_main()
