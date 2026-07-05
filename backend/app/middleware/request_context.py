import time
import uuid
from typing import Callable

from fastapi import Request, Response


async def request_context_middleware(
    request: Request,
    call_next: Callable,
) -> Response:
    """
    Adds request tracing metadata required by SRS Chapter 21.17.
    """
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    start = time.time()
    response = await call_next(request)
    elapsed_ms = int((time.time() - start) * 1000)

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = str(elapsed_ms)
    return response
