import os
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "epc_worker",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Configure retry behavior globally if desired, though we will set it per task
)

# Auto-discover tasks in the app.tasks module
celery_app.autodiscover_tasks(["app.tasks.ingestion_tasks"])
