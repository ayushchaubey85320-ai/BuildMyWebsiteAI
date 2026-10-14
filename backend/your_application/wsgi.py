import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    from a2wsgi import ASGIMiddleware
    from app.main import app as asgi_app
    application = ASGIMiddleware(asgi_app)
    app = application
except Exception:
    from app.main import app as application
    app = application
