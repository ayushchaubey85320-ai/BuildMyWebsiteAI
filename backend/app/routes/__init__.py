from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .generator import router as generator_router
from .export import router as export_router
from .admin import router as admin_router

__all__ = ["auth_router", "dashboard_router", "generator_router", "export_router", "admin_router"]
