"""
Smart launcher for SevaSetu Python web application.
Automatically checks if Flask is installed:
- If Flask is installed: launches Flask application.
- If not installed: launches the zero-dependency standard library server.
Run with:
    python app.py
Or via Gunicorn:
    gunicorn app:app
    gunicorn wsgi:app
"""

import sys
import os

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Expose WSGI application instance for Gunicorn (gunicorn app:app)
try:
    from flask_app import app
    application = app
except Exception:
    app = None
    application = None

def main():
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    try:
        import flask
        print("[*] Flask detected! Launching with Flask framework...")
        from flask_app import app
        app.run(host='0.0.0.0', port=port, debug=True)
    except ImportError:
        print("[*] Flask not detected. Launching with zero-dependency Python standard library server...")
        from server import run_server
        run_server(port)

if __name__ == '__main__':
    main()
