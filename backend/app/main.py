from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import init_db
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.cases import router as cases_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure ephemeral upload directory exists
    os.makedirs(settings.EVIDENCE_UPLOAD_DIR, exist_ok=True)
    # Initialize DB tables
    await init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Cyber-Forensic Command Center for Voice, Conversation, Message, URL, and Phone Number Impersonation Analysis",
    version="3.0",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(cases_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "3.0",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": f"{settings.API_V1_PREFIX}/health"
    }
