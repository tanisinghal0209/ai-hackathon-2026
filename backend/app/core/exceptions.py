"""
Chapter 21.18 — Standardised Error Handling

Defines four error categories with structured HTTP responses.
Every error returns: HTTP status, error code, human message,
developer message, correlation ID, and recovery suggestion.
"""
from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Optional


class PlatformError(Exception):
    """Base class for all platform errors."""
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        developer_message: Optional[str] = None,
        recovery: Optional[str] = None,
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.developer_message = developer_message or message
        self.recovery = recovery
        super().__init__(message)


# ---- Category 1: Validation Errors ----------------------------------------

class ValidationError(PlatformError):
    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            status_code=422,
            error_code="VALIDATION_ERROR",
            message=message,
            developer_message=f"Validation failed on field: {field}" if field else message,
            recovery="Check request payload and try again.",
        )


class UnsupportedFileTypeError(PlatformError):
    def __init__(self, filename: str):
        super().__init__(
            status_code=415,
            error_code="UNSUPPORTED_FILE_TYPE",
            message=f"File type not supported: {filename}",
            developer_message="Only .pdf and .csv files are currently accepted.",
            recovery="Convert the document to PDF and retry.",
        )


# ---- Category 2: Business Logic Errors ------------------------------------

class DocumentNotFoundError(PlatformError):
    def __init__(self, document_id: str):
        super().__init__(
            status_code=404,
            error_code="DOCUMENT_NOT_FOUND",
            message=f"Document {document_id} was not found.",
            recovery="Verify the document ID and project assignment.",
        )


class ProjectNotFoundError(PlatformError):
    def __init__(self, project_id: str):
        super().__init__(
            status_code=404,
            error_code="PROJECT_NOT_FOUND",
            message=f"Project {project_id} was not found.",
            recovery="Verify the project ID before submitting a request.",
        )


class InsufficientContextError(PlatformError):
    def __init__(self):
        super().__init__(
            status_code=422,
            error_code="INSUFFICIENT_CONTEXT",
            message="Not enough project knowledge was retrieved to answer this question.",
            recovery="Upload relevant specifications or documents and retry.",
        )


# ---- Category 3: Infrastructure Errors ------------------------------------

class StorageError(PlatformError):
    def __init__(self, detail: str = ""):
        super().__init__(
            status_code=503,
            error_code="STORAGE_ERROR",
            message="A file storage error occurred.",
            developer_message=detail,
            recovery="Check storage connectivity and retry.",
        )


class DatabaseError(PlatformError):
    def __init__(self, detail: str = ""):
        super().__init__(
            status_code=503,
            error_code="DATABASE_ERROR",
            message="A database error occurred.",
            developer_message=detail,
            recovery="Check database connectivity and retry.",
        )


class QueueError(PlatformError):
    def __init__(self, detail: str = ""):
        super().__init__(
            status_code=503,
            error_code="QUEUE_ERROR",
            message="The background job queue is unavailable.",
            developer_message=detail,
            recovery="Ensure Redis is running and retry.",
        )


# ---- Category 4: AI Errors ------------------------------------------------

class AIProviderError(PlatformError):
    def __init__(self, provider: str = "Claude", detail: str = ""):
        super().__init__(
            status_code=502,
            error_code="AI_PROVIDER_ERROR",
            message=f"The AI provider ({provider}) returned an error.",
            developer_message=detail,
            recovery="Retry the request. If the issue persists, check API key validity.",
        )


class PromptTooLargeError(PlatformError):
    def __init__(self, token_count: int):
        super().__init__(
            status_code=413,
            error_code="PROMPT_TOO_LARGE",
            message=f"Assembled prompt exceeds token limit ({token_count} tokens).",
            recovery="Reduce the scope of the query or decrease retrieval limit.",
        )


class AuthorizationError(PlatformError):
    def __init__(self, capability: str):
        super().__init__(
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
            message="You do not have permission to perform this operation.",
            developer_message=f"Missing capability: {capability}",
            recovery="Ask a project administrator to grant the required capability.",
        )


class RateLimitError(PlatformError):
    def __init__(self, limit: int, window_seconds: int):
        super().__init__(
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED",
            message="Too many requests. Please slow down and try again.",
            developer_message=f"Limit is {limit} requests per {window_seconds} seconds.",
            recovery="Wait for the rate-limit window to reset.",
        )


# ---- Global Exception Handler ---------------------------------------------

async def platform_error_handler(request: Request, exc: PlatformError) -> JSONResponse:
    """Registered with FastAPI to intercept all PlatformError subclasses."""
    correlation_id = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "developer_message": exc.developer_message,
                "recovery": exc.recovery,
                "correlation_id": correlation_id,
            }
        },
    )


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catches unhandled exceptions to prevent raw stack traces leaking."""
    correlation_id = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred.",
                "developer_message": str(exc),
                "recovery": "Contact platform support with the correlation ID.",
                "correlation_id": correlation_id,
            }
        },
    )
