import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import init_db, SessionLocal
from app.services.seed_data import seed_database_if_empty

from app.api.health import router as health_router
from app.api.dashboard import router as dashboard_router
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.search import router as search_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Initializing {settings.PROJECT_NAME} database...")
    init_db()

    # Automatically seed enterprise SOP dataset if database is brand new
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

    yield
    print("Shutting down OPERA backend service...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Operations Assistant for Enterprise Standard Operating Procedures.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)


@app.get("/api")
def api_info():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "operational",
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }


# Static Frontend Mounting
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_candidate = os.path.join(dist_path, full_path)
        if os.path.exists(file_candidate) and os.path.isfile(file_candidate):
            return FileResponse(file_candidate)
        return FileResponse(os.path.join(dist_path, "index.html"))
