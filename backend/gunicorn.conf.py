import os

# Automatically bind to Render's dynamic $PORT
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Set workers from Render's WEB_CONCURRENCY or default to 1
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 5
