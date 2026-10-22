"""Cadena de proveedores LLM con fallback: Groq -> OpenAI -> HuggingFace.

Si ninguno está configurado o todos fallan, el agente pasa a modo degradado
(guardas deterministas + documentos RAG), ver ``agent.agent``.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Sequence

from langchain_core.messages import BaseMessage

from config import get_settings

logger = logging.getLogger("adastra-ai.llm")


@dataclass
class Provider:
    name: str
    model: Any  # BaseChatModel (o un doble de pruebas con .invoke / .bind_tools)


class AllProvidersFailed(Exception):
    def __init__(self, errors: list[tuple[str, Exception]]):
        self.errors = errors
        last = errors[-1][1] if errors else None
        super().__init__(f"Todos los proveedores fallaron: {last}")

    @property
    def rate_limited(self) -> bool:
        return any(is_rate_limit_error(e) for _, e in self.errors)


def is_rate_limit_error(err: Exception) -> bool:
    text = str(err).lower()
    return "429" in text or "too many" in text or "rate_limit" in text or "rate limit" in text


_providers_cache: list[Provider] | None = None


def build_providers() -> list[Provider]:
    """Crea los clientes según las variables de entorno. Se cachea por proceso."""
    s = get_settings()
    timeout = s.llm_timeout_seconds
    providers: list[Provider] = []
    if s.groq_api_key:
        try:
            from langchain_groq import ChatGroq
            providers.append(Provider("groq", ChatGroq(model=s.groq_model, api_key=s.groq_api_key,
                                                       temperature=0.3, timeout=timeout, max_retries=1)))
        except Exception as e:  # pragma: no cover - depende del entorno
            logger.error("No se pudo crear el cliente Groq: %s", e)
    if s.openai_api_key:
        try:
            from langchain_openai import ChatOpenAI
            providers.append(Provider("openai", ChatOpenAI(model=s.openai_model, api_key=s.openai_api_key,
                                                           temperature=0.3, timeout=timeout, max_retries=1)))
        except Exception as e:  # pragma: no cover
            logger.error("No se pudo crear el cliente OpenAI: %s", e)
    if s.hf_token:
        try:
            from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
            llm = HuggingFaceEndpoint(repo_id=s.hf_model, huggingfacehub_api_token=s.hf_token,
                                      temperature=0.3, max_new_tokens=512, timeout=timeout)
            providers.append(Provider("huggingface", ChatHuggingFace(llm=llm)))
        except Exception as e:  # pragma: no cover
            logger.error("No se pudo crear el cliente HuggingFace: %s", e)
    return providers


def get_providers() -> list[Provider]:
    global _providers_cache
    if _providers_cache is None:
        _providers_cache = build_providers()
    return _providers_cache


def reset_providers() -> None:
    global _providers_cache
    _providers_cache = None


def invoke_with_fallback(providers: Sequence[Provider], messages: list[BaseMessage], tools: list) -> tuple[Any, str]:
    """Prueba cada proveedor en orden. Devuelve (respuesta, nombre_proveedor).

    Si un proveedor no admite herramientas, se le llama sin ellas.
    """
    errors: list[tuple[str, Exception]] = []
    for p in providers:
        try:
            try:
                runnable = p.model.bind_tools(tools) if tools else p.model
            except NotImplementedError:
                runnable = p.model
            response = runnable.invoke(messages)
            return response, p.name
        except Exception as e:
            logger.error("Proveedor %s falló: %s", p.name, str(e)[:300])
            errors.append((p.name, e))
    raise AllProvidersFailed(errors)
