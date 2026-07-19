"""
Chapter 21.15 — Configuration Management
All runtime configuration is read from environment variables.
No configuration shall be hardcoded in application logic.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "NexusEPC AI API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database (21.8)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # AI Providers (21.9)
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")

    # Message Broker / Celery (21.16)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Ingestion limits (21.15)
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "200"))
    CHUNK_SIZE_TOKENS: int = int(os.getenv("CHUNK_SIZE_TOKENS", "512"))
    CHUNK_OVERLAP_TOKENS: int = int(os.getenv("CHUNK_OVERLAP_TOKENS", "50"))

    # Retrieval tuning (21.10)
    RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", "8"))
    RETRIEVAL_MAX_TOKENS: int = int(os.getenv("RETRIEVAL_MAX_TOKENS", "6000"))

    # Prompt versioning (21.9)
    PROMPT_VERSION: str = os.getenv("PROMPT_VERSION", "v1.0")

    # Feature flags (21.15)
    ENABLE_RERANKING: bool = os.getenv("ENABLE_RERANKING", "false").lower() == "true"
    ENABLE_OCR: bool = os.getenv("ENABLE_OCR", "false").lower() == "true"

    # Security / rate limiting (21.36-21.39)
    DEMO_USER_ID: str = os.getenv("DEMO_USER_ID", "demo-user")
    DEMO_USER_ROLE: str = os.getenv("DEMO_USER_ROLE", "Project Administrator")
    ENABLE_RATE_LIMITING: bool = os.getenv("ENABLE_RATE_LIMITING", "true").lower() == "true"
    RATE_LIMIT_WINDOW_SECONDS: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
    RATE_LIMIT_DEFAULT_REQUESTS: int = int(os.getenv("RATE_LIMIT_DEFAULT_REQUESTS", "120"))
    RATE_LIMIT_AI_REQUESTS: int = int(os.getenv("RATE_LIMIT_AI_REQUESTS", "20"))

    # Startup validation (21.31 / 21.42)
    REQUIRE_AI_KEYS_ON_STARTUP: bool = os.getenv("REQUIRE_AI_KEYS_ON_STARTUP", "false").lower() == "true"

    class Config:
        case_sensitive = True

    def validate_startup(self) -> list[str]:
        missing = []
        if self.REQUIRE_AI_KEYS_ON_STARTUP:
            if not self.ANTHROPIC_API_KEY:
                missing.append("ANTHROPIC_API_KEY")
            if not self.OPENAI_API_KEY:
                missing.append("OPENAI_API_KEY")
        return missing


settings = Settings()
