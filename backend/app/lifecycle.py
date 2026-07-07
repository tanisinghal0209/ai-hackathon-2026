import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config.config import settings
from app.core.logging import configure_logging
from app.database.session import engine, Base
from app.prompts.registry import PromptRegistry


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Deterministic startup/shutdown lifecycle for shared infrastructure.
    """
    configure_logging()

    # Automatically create database tables for local SQLite development
    Base.metadata.create_all(bind=engine)

    missing = settings.validate_startup()
    if missing:
        raise RuntimeError(f"Missing mandatory startup configuration: {', '.join(missing)}")

    app.state.settings = settings
    app.state.prompt_registry = PromptRegistry()
    app.state.database_engine = engine

    logger.info(
        "application_startup_complete",
        extra={
            "service": "api",
            "operation": "startup",
            "result_status": "success",
        },
    )

    try:
        yield
    finally:
        engine.dispose()
        logger.info(
            "application_shutdown_complete",
            extra={
                "service": "api",
                "operation": "shutdown",
                "result_status": "success",
            },
        )

