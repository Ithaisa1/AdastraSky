"""Guardas deterministas del asistente.

Las reglas viven en ``agent/rules/guard_rules.json`` para poder mantenerlas sin
tocar código. Se aplican antes de llamar al LLM (inyección de prompt, saludos,
insultos sin contenido astronómico) y como red de seguridad cuando todos los
proveedores fallan (detección de temas fuera de ámbito). No dependen de ningún
modelo, así que funcionan igual en modo offline.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Literal

RULES_PATH = Path(__file__).parent / "rules" / "guard_rules.json"

Verdict = Literal["allow", "greeting", "injection", "offensive"]

_LEET = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"})


def normalize(text: str) -> str:
    """Minúsculas, sin tildes (conservando la ñ), ß -> ss y espacios compactados."""
    text = (text or "").lower().replace("ß", "ss").replace("ñ", "\x00")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.replace("\x00", "ñ")
    return re.sub(r"\s+", " ", text).strip()


def _words(text: str) -> list[str]:
    return re.findall(r"[a-zñ0-9@$]+", text)


def _phrase_regex(phrases: list[str]) -> re.Pattern | None:
    items = [re.escape(normalize(p)) for p in phrases if p.strip()]
    if not items:
        return None
    return re.compile(r"(?<![a-zñ0-9])(" + "|".join(sorted(items, key=len, reverse=True)) + r")(?![a-zñ0-9])")


@dataclass(frozen=True)
class GuardRules:
    greeting_words: frozenset[str]
    offensive_words: frozenset[str]
    offensive_phrases: re.Pattern | None
    injection_patterns: tuple[re.Pattern, ...]
    astro_words: frozenset[str]
    astro_phrases: re.Pattern | None
    astro_prefixes: tuple[str, ...]


def _split_single_multi(items: list[str]) -> tuple[set[str], list[str]]:
    single, multi = set(), []
    for item in items:
        n = normalize(item)
        (multi.append(n) if " " in n else single.add(n))
    return single, multi


def load_rules(path: Path = RULES_PATH) -> GuardRules:
    data = json.loads(path.read_text(encoding="utf-8"))
    off_single, off_multi = _split_single_multi(data["offensive"]["words"])
    off_multi += [normalize(p) for p in data["offensive"].get("phrases", [])]
    astro_single, astro_multi = _split_single_multi(data["astronomy"]["words"])
    pref_single, pref_multi = _split_single_multi(data["astronomy"]["prefixes"])
    patterns = []
    for raw in data["injection"]["patterns"]:
        patterns.append(re.compile(raw))  # falla al arrancar si una regla está mal escrita
    return GuardRules(
        greeting_words=frozenset(normalize(w) for w in data["greetings"]["words"]),
        offensive_words=frozenset(off_single),
        offensive_phrases=_phrase_regex(off_multi),
        injection_patterns=tuple(patterns),
        astro_words=frozenset(astro_single),
        astro_phrases=_phrase_regex(astro_multi + pref_multi),
        astro_prefixes=tuple(sorted(pref_single)),
    )


@lru_cache()
def get_rules() -> GuardRules:
    return load_rules()


def is_greeting_only(text: str, rules: GuardRules | None = None) -> bool:
    rules = rules or get_rules()
    words = _words(normalize(text))
    return 0 < len(words) <= 5 and all(w in rules.greeting_words for w in words)


def is_injection(text: str, rules: GuardRules | None = None) -> bool:
    rules = rules or get_rules()
    norm = normalize(text)
    return any(p.search(norm) for p in rules.injection_patterns)


def is_offensive(text: str, rules: GuardRules | None = None) -> bool:
    rules = rules or get_rules()
    norm = normalize(text)
    # Se comprueba el texto tal cual y con sustituciones leet ("m1erd4").
    for candidate in {norm, norm.translate(_LEET)}:
        words = _words(candidate)
        # Colapsa letras repetidas ("mierdaaa" -> "mierda") solo para comparar.
        collapsed = [re.sub(r"(.)\1{2,}", r"\1", w) for w in words]
        if any(w in rules.offensive_words for w in words + collapsed):
            return True
        if rules.offensive_phrases and rules.offensive_phrases.search(candidate):
            return True
    return False


def looks_astronomical(text: str, rules: GuardRules | None = None) -> bool:
    rules = rules or get_rules()
    norm = normalize(text)
    words = _words(norm)
    if any(w in rules.astro_words for w in words):
        return True
    if any(w.startswith(p) for w in words for p in rules.astro_prefixes):
        return True
    return bool(rules.astro_phrases and rules.astro_phrases.search(norm))


def pre_llm_check(text: str) -> Verdict:
    """Decisión previa al LLM.

    - injection: respuesta fija, nunca se envía al modelo.
    - greeting: saludo puro, respuesta fija.
    - offensive: insulto sin contenido astronómico -> respuesta educada fija.
      Si el mensaje ofensivo incluye una pregunta astronómica se deja pasar:
      el prompt del sistema obliga a responder con educación.
    - allow: el resto.
    """
    if is_injection(text):
        return "injection"
    if is_greeting_only(text):
        return "greeting"
    if is_offensive(text) and not looks_astronomical(text):
        return "offensive"
    return "allow"
