import os
import sys

# Ensure backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for d in [BACKEND_DIR, ROOT_DIR, CURRENT_DIR]:
    if d not in sys.path:
        sys.path.insert(0, d)

# Wrap FastAPI ASGI app with a2wsgi for WSGI compatibility with vanilla gunicorn
try:
    from a2wsgi import ASGIMiddleware
    from app.main import app as asgi_app
    application = ASGIMiddleware(asgi_app)
    app = application
except Exception:
    from app.main import app as application
    app = application
