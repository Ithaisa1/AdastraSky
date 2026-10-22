"""Caché de respuestas en memoria con TTL.

Reglas:
- Solo se cachean respuestas finales (sin llamadas a herramientas) y no vacías.
- Solo se usa en el primer turno de una conversación: con historial, la misma
  pregunta («¿Y desde el Teide?») puede significar cosas distintas.
- La clave depende del texto normalizado y del idioma, nunca del usuario, y por
  eso tampoco se cachean respuestas que dependen de datos en tiempo real
  (clima, planificador). Así no se mezclan datos privados entre usuarios.
"""

from __future__ import annotations

import re
import threading
import time
from collections import OrderedDict
from typing import Callable

from agent.guards import normalize


class ResponseCache:
    def __init__(self, ttl_seconds: float = 3600, max_entries: int = 200, clock: Callable[[], float] = time.monotonic):
        self.ttl = ttl_seconds
        self.max_entries = max_entries
        self._clock = clock
        self._data: "OrderedDict[str, tuple[float, str]]" = OrderedDict()
        self._lock = threading.Lock()

    @staticmethod
    def key(query: str, lang: str) -> str:
        q = normalize(query)
        q = re.sub(r"[^a-zñ0-9\s]", "", q)
        q = re.sub(r"\s+", " ", q).strip()
        return f"{lang}::{q}"

    def get(self, query: str, lang: str) -> str | None:
        k = self.key(query, lang)
        with self._lock:
            entry = self._data.get(k)
            if entry is None:
                return None
            ts, value = entry
            if self._clock() - ts > self.ttl:
                del self._data[k]
                return None
            self._data.move_to_end(k)
            return value

    def set(self, query: str, lang: str, value: str) -> bool:
        if not isinstance(value, str) or not value.strip():
            return False
        k = self.key(query, lang)
        if not k.split("::", 1)[1]:
            return False
        with self._lock:
            self._data[k] = (self._clock(), value)
            self._data.move_to_end(k)
            while len(self._data) > self.max_entries:
                self._data.popitem(last=False)
        return True

    def clear(self) -> None:
        with self._lock:
            self._data.clear()

    def __len__(self) -> int:
        return len(self._data)
