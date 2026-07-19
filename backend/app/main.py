from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import settings
from app.core.exceptions import PlatformError, generic_error_handler, platform_error_handler
from app.lifecycle import lifespan
from app.middleware.rate_limit import rate_limit_middleware
from app.middleware.request_context import request_context_middleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be the specific origin of the frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(request_context_middleware)
app.middleware("http")(rate_limit_middleware)
app.add_exception_handler(PlatformError, platform_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

@app.get("/")
def read_root():
    return {"message": "Welcome to the NexusEPC AI API"}

from app.routers import ingestion, health, copilot, compliance, schedule
app.include_router(ingestion.router, prefix=settings.API_V1_STR + "/ingestion", tags=["ingestion"])
app.include_router(health.router, prefix=settings.API_V1_STR + "/health", tags=["health"])
app.include_router(copilot.router, prefix=settings.API_V1_STR + "/copilot", tags=["copilot"])
app.include_router(compliance.router, prefix=settings.API_V1_STR + "/compliance", tags=["compliance"])
app.include_router(schedule.router, prefix=settings.API_V1_STR + "/schedule", tags=["schedule"])
