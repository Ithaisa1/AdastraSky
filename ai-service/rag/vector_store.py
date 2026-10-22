"""
RAG ligero en memoria — TF-IDF + similitud coseno (scikit-learn).

Multilingüe: carga documentos ``*.es.md``, ``*.en.md`` y ``*.de.md``.

Diseño (v2, evaluado con ``scripts/eval_rag.py``):
- Fragmentos por sección Markdown (encabezado + contenido) en lugar de por
  párrafo. Cada fragmento lleva delante el título del documento y de la
  sección, así una consulta como «telescopios del Teide» encuentra la sección
  «Telescopios principales» del documento del Teide.
- Sin tildes ni palabras vacías (es/en/de) antes de vectorizar.
- Dos representaciones combinadas: palabras (1-2 gramas, sin tildes) y
  n-gramas de caracteres (3-5), que toleran variaciones morfológicas e
  idiomáticas («Perseidas», «Perseids», «Perseiden»).
- Vocabulario completo (el límite anterior de 2000 términos dejaba fuera
  palabras como «perseiden»).
- Prioridad al idioma del usuario; los otros idiomas solo completan si faltan
  resultados, y nunca se repite el mismo documento/sección en otro idioma.
"""

from __future__ import annotations

import logging
import re
import threading
import unicodedata
from collections import OrderedDict
from functools import lru_cache
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from rag.stopwords import STOPWORDS

logger = logging.getLogger("adastra-ai.rag")

DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"
LANG_PATTERN = re.compile(r"\.(es|en|de)\.md$")
MIN_SCORE = 0.05  # por debajo de esto se considera que no hay coincidencia útil
WORD_WEIGHT = 0.6
CHAR_WEIGHT = 0.4


def preprocess(text: str) -> str:
    """Minúsculas, sin tildes y sin palabras vacías (es/en/de)."""
    text = unicodedata.normalize("NFKD", (text or "").lower().replace("ß", "ss"))
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(w for w in re.findall(r"\w+", text) if w not in STOPWORDS)


def _detect_language(filename: str) -> str:
    match = LANG_PATTERN.search(filename)
    return match.group(1) if match else "es"


class Document:
    def __init__(self, page_content: str, metadata: dict):
        self.page_content = page_content
        self.metadata = metadata

    def __repr__(self) -> str:  # pragma: no cover - ayuda de depuración
        return f"Document({self.metadata.get('chunk_id')!r})"


def split_sections(content: str) -> tuple[str, list[tuple[str, str]]]:
    """Devuelve (título_documento, [(título_sección, texto_sección), ...])."""
    doc_title = ""
    sections: list[tuple[str, list[str]]] = []
    current_title, current_lines = "", []
    for line in content.splitlines():
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level, title = len(m.group(1)), m.group(2).strip()
            if level == 1 and not doc_title:
                doc_title = title
                current_title = title
                continue
            if any(l.strip() for l in current_lines):
                sections.append((current_title, current_lines))
            current_title, current_lines = title, []
        else:
            current_lines.append(line)
    if any(l.strip() for l in current_lines):
        sections.append((current_title, current_lines))
    cleaned = [(t, re.sub(r"\n{3,}", "\n\n", "\n".join(ls)).strip()) for t, ls in sections]
    return doc_title, [(t, txt) for t, txt in cleaned if txt]


class InMemoryVectorStore:
    def __init__(self, documents_dir: Path = DOCUMENTS_DIR):
        self.documents_dir = documents_dir
        self.chunks: list[Document] = []
        self.word_vectorizer = TfidfVectorizer(
            preprocessor=preprocess, analyzer="word",
            ngram_range=(1, 2), sublinear_tf=True, token_pattern=r"(?u)\b\w+\b",
        )
        self.char_vectorizer = TfidfVectorizer(
            preprocessor=preprocess, analyzer="char_wb",
            ngram_range=(3, 5), sublinear_tf=True,
        )
        self._word_matrix = None
        self._char_matrix = None
        self._loaded = False

    # Compatibilidad con código antiguo que usaba ``store.vectorizer``.
    @property
    def vectorizer(self):
        return self.word_vectorizer

    def load_documents(self):
        if not self.documents_dir.exists():
            logger.warning("Directorio de documentos no encontrado: %s", self.documents_dir)
            return
        files = sorted(self.documents_dir.glob("*.md"))
        for md_file in files:
            content = md_file.read_text(encoding="utf-8")
            lang = _detect_language(md_file.name)
            doc_id = LANG_PATTERN.sub("", md_file.name).removesuffix(".md")
            doc_title, sections = split_sections(content)
            doc_title = doc_title or doc_id.replace("_", " ").title()
            for idx, (section_title, text) in enumerate(sections):
                header = doc_title if section_title in ("", doc_title) else f"{doc_title} — {section_title}"
                self.chunks.append(Document(
                    page_content=f"{header}\n{text}",
                    metadata={
                        "source": "Documento IAC",
                        "title": doc_title,
                        "section": section_title if section_title != doc_title else "",
                        "file": md_file.name,
                        "doc_id": doc_id,
                        "language": lang,
                        "chunk_id": f"{doc_id}#{idx}",
                    },
                ))
        if not self.chunks:
            logger.warning("No se encontraron documentos para el RAG")
            return
        texts = [d.page_content for d in self.chunks]
        self._word_matrix = self.word_vectorizer.fit_transform(texts)
        self._char_matrix = self.char_vectorizer.fit_transform(texts)
        self._loaded = True
        logger.info("RAG: %d fragmentos indexados de %d documentos", len(self.chunks), len(files))

    def _scores(self, query: str) -> np.ndarray:
        w = cosine_similarity(self.word_vectorizer.transform([query]), self._word_matrix).flatten()
        c = cosine_similarity(self.char_vectorizer.transform([query]), self._char_matrix).flatten()
        return WORD_WEIGHT * w + CHAR_WEIGHT * c

    def search_with_scores(self, query: str, k: int = 3, lang: str | None = None,
                           prefer_lang: str | None = None, min_score: float = MIN_SCORE) -> list[tuple[Document, float]]:
        """Busca fragmentos.

        - ``lang``: filtra estrictamente por idioma.
        - ``prefer_lang``: primero el idioma indicado; otros idiomas solo para
          completar, sin repetir una sección ya devuelta en otro idioma.
        """
        if not self._loaded or not query or not query.strip():
            return []
        scores = self._scores(query)
        order = np.argsort(scores)[::-1]
        candidates = [(self.chunks[i], float(scores[i])) for i in order if scores[i] >= min_score]
        if lang is not None:
            return [c for c in candidates if c[0].metadata["language"] == lang][:k]
        if prefer_lang is None:
            return candidates[:k]
        preferred = [c for c in candidates if c[0].metadata["language"] == prefer_lang]
        result = preferred[:k]
        seen = {c[0].metadata["chunk_id"] for c in result}
        for c in candidates:
            if len(result) >= k:
                break
            if c[0].metadata["chunk_id"] not in seen:
                result.append(c)
                seen.add(c[0].metadata["chunk_id"])
        return result

    def similarity_search(self, query: str, k: int = 3, lang: str | None = None,
                          prefer_lang: str | None = None) -> list[Document]:
        return [d for d, _ in self.search_with_scores(query, k=k, lang=lang, prefer_lang=prefer_lang)]


class CachedRAG:
    """Caché LRU acotada de búsquedas (antes crecía sin límite)."""

    def __init__(self, max_entries: int = 256):
        self._cache: "OrderedDict[tuple, list]" = OrderedDict()
        self._max = max_entries
        self._lock = threading.Lock()

    def search(self, query: str, k: int = 3, lang: str | None = None, prefer_lang: str | None = None) -> list[Document]:
        key = (query.strip().lower(), k, lang, prefer_lang)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
                return self._cache[key]
        result = get_vector_store().similarity_search(query, k=k, lang=lang, prefer_lang=prefer_lang)
        with self._lock:
            self._cache[key] = result
            while len(self._cache) > self._max:
                self._cache.popitem(last=False)
        return result

    def __len__(self) -> int:
        return len(self._cache)


_cached_rag = None


def get_cached_rag() -> CachedRAG:
    global _cached_rag
    if _cached_rag is None:
        _cached_rag = CachedRAG()
    return _cached_rag


@lru_cache()
def get_vector_store() -> InMemoryVectorStore:
    store = InMemoryVectorStore()
    store.load_documents()
    return store
