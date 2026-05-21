from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import admin_router, auth_router, contact_router, health_router, items_router


settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router.router)
app.include_router(auth_router.router, prefix="/api")
app.include_router(items_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(contact_router.router, prefix="/api")
