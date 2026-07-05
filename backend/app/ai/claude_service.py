import logging
import time
from typing import Any, AsyncIterator, Dict, List, Optional

from anthropic import AsyncAnthropic

from app.config.config import settings
from app.core.exceptions import AIProviderError


logger = logging.getLogger(__name__)


class ClaudeService:
    """
    Central Anthropic Claude gateway.

    SRS Chapter 21 requires all Claude calls to pass through a dedicated AI
    service so retries, provider swaps, prompt versioning, and token accounting
    can be handled in one place.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.model = model or settings.CLAUDE_MODEL
        self.client = AsyncAnthropic(api_key=api_key or settings.ANTHROPIC_API_KEY)

    async def create_message(
        self,
        *,
        messages: List[Dict[str, Any]],
        system: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        max_tokens: int = 2048,
        temperature: float = 0.0,
    ) -> Any:
        started_at = time.time()
        try:
            kwargs: Dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages,
            }
            if system:
                kwargs["system"] = system
            if tools:
                kwargs["tools"] = tools

            response = await self.client.messages.create(**kwargs)
            elapsed_ms = int((time.time() - started_at) * 1000)
            logger.info(
                "claude_message_completed",
                extra={
                    "model": self.model,
                    "latency_ms": elapsed_ms,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )
            return response
        except Exception as exc:
            raise AIProviderError(provider="Claude", detail=str(exc)) from exc

    async def stream_message(
        self,
        *,
        messages: List[Dict[str, Any]],
        system: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.0,
    ) -> AsyncIterator[Any]:
        started_at = time.time()
        try:
            kwargs: Dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": messages,
                "stream": True,
            }
            if system:
                kwargs["system"] = system

            stream = await self.client.messages.create(**kwargs)
            async for chunk in stream:
                yield chunk
            elapsed_ms = int((time.time() - started_at) * 1000)
            logger.info(
                "claude_stream_completed",
                extra={
                    "model": self.model,
                    "latency_ms": elapsed_ms,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )
        except Exception as exc:
            raise AIProviderError(provider="Claude", detail=str(exc)) from exc
