import time
from collections import defaultdict, deque
from typing import Callable, Deque, Dict, Tuple

from fastapi import Request, Response

from app.config.config import settings
from app.core.exceptions import RateLimitError


RateBucket = Tuple[str, str]
_requests: Dict[RateBucket, Deque[float]] = defaultdict(deque)


def _limit_for_path(path: str) -> int:
    ai_paths = ("/copilot", "/compliance", "/schedule")
    if any(segment in path for segment in ai_paths):
        return settings.RATE_LIMIT_AI_REQUESTS
    return settings.RATE_LIMIT_DEFAULT_REQUESTS


async def rate_limit_middleware(request: Request, call_next: Callable) -> Response:
    if not settings.ENABLE_RATE_LIMITING:
        return await call_next(request)

    now = time.time()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    client_id = request.headers.get("X-Demo-User-ID") or request.client.host if request.client else "anonymous"
    key = (client_id, request.url.path)
    bucket = _requests[key]

    while bucket and now - bucket[0] > window:
        bucket.popleft()

    limit = _limit_for_path(request.url.path)
    if len(bucket) >= limit:
        raise RateLimitError(limit=limit, window_seconds=window)

    bucket.append(now)
    return await call_next(request)
