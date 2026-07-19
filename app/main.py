from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, this should be the specific origin of the frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the NexusEPC AI API"}

from app.routers import ingestion, health, copilot, compliance, schedule
app.include_router(ingestion.router, prefix=settings.API_V1_STR + "/ingestion", tags=["ingestion"])
app.include_router(health.router, prefix=settings.API_V1_STR + "/health", tags=["health"])
app.include_router(copilot.router, prefix=settings.API_V1_STR + "/copilot", tags=["copilot"])
app.include_router(compliance.router, prefix=settings.API_V1_STR + "/compliance", tags=["compliance"])
app.include_router(schedule.router, prefix=settings.API_V1_STR + "/schedule", tags=["schedule"])
