"""
Junior Journalist - Main Entrypoint
Exports the FastAPI app from server.py to support both:
  - uvicorn main:app
  - uvicorn server:app
"""
from server import app

__all__ = ["app"]
