"""
WSGI Entry point for SevaSetu web application.
Used by production WSGI servers like Gunicorn, uWSGI, or cloud platforms
(Render, Railway, Heroku, DigitalOcean, PythonAnywhere, AWS Elastic Beanstalk).

Start Command for cloud deployment:
    gunicorn wsgi:app
or:
    gunicorn wsgi:application
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PY_APP_DIR = os.path.join(BASE_DIR, 'sevasetu_python')

if PY_APP_DIR not in sys.path:
    sys.path.insert(0, PY_APP_DIR)

# Switch working directory to sevasetu_python so relative data/template paths resolve cleanly
os.chdir(PY_APP_DIR)

from flask_app import app

# Standard WSGI aliases
application = app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
