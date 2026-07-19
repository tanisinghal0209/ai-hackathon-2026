import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load backend/.env into the process environment. This was previously never
# called anywhere in the app, so ANTHROPIC_API_KEY / OPENAI_API_KEY / SUPABASE_*
# would silently be empty strings when running locally (outside Docker, which
# injects env vars via `env_file` instead). load_dotenv() never overrides a
# variable that's already set, so this is safe to call in both environments.
load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "NexusEPC AI API"
    API_V1_STR: str = "/api/v1"

    # Supabase config
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Anthropic config
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # OpenAI config (used directly by embeddings.py / retriever.py via os.getenv,
    # kept here too so a missing key is visible at startup if you check settings)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        case_sensitive = True


settings = Settings()
