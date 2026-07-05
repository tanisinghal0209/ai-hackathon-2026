import os
from celery import Celery
from kombu import Queue

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
    task_default_queue="document_processing",
    task_queues=(
        Queue("document_processing"),
        Queue("ocr"),
        Queue("embedding"),
        Queue("compliance"),
        Queue("schedule_analysis"),
        Queue("notification"),
        Queue("maintenance"),
    ),
    task_routes={
        "app.tasks.ingestion_tasks.process_document_task": {
            "queue": "document_processing"
        },
    },
)

# Auto-discover tasks in the app.tasks module
celery_app.autodiscover_tasks(["app.tasks.ingestion_tasks"])
