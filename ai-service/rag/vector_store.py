"""
RAG ligero en memoria — TF-IDF + cosine similarity.
Multilingüe: carga documentos .es.md, .en.md, .de.md
y filtra por idioma en las búsquedas.
"""

import re
from pathlib import Path
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"

LANG_PATTERN = re.compile(r"\.(es|en|de)\.md$")


def _detect_language(filename: str) -> str:
    match = LANG_PATTERN.search(filename)
    return match.group(1) if match else "es"


class Document:
    def __init__(self, page_content: str, metadata: dict):
        self.page_content = page_content
        self.metadata = metadata


class InMemoryVectorStore:
    def __init__(self):
        self.chunks: list[Document] = []
        self.vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words=None,
            lowercase=True,
            analyzer="word",
        )
        self._tfidf_matrix = None
        self._loaded = False

    def load_documents(self):
        if not DOCUMENTS_DIR.exists():
            print("[WARN] Directorio de documentos no encontrado")
            return

        for md_file in sorted(DOCUMENTS_DIR.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")
            raw_stem = md_file.stem
            stem = raw_stem[:-3] if LANG_PATTERN.search(raw_stem + ".md") else raw_stem
            title = stem.replace("_", " ").replace("-", " ").title()
            lang = _detect_language(md_file.name)
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", content) if p.strip()]

            for para in paragraphs:
                self.chunks.append(
                    Document(
                        page_content=para,
                        metadata={
                            "source": "Documento IAC",
                            "title": title,
                            "file": md_file.name,
                            "language": lang,
                        },
                    )
                )

        if not self.chunks:
            print("[WARN] No se encontraron documentos IAC")
            return

        texts = [d.page_content for d in self.chunks]
        self._tfidf_matrix = self.vectorizer.fit_transform(texts)
        self._loaded = True
        print(f"[OK] {len(self.chunks)} fragmentos indexados de {len(list(DOCUMENTS_DIR.glob('*.md')))} documentos")

    def similarity_search(self, query: str, k: int = 3, lang: str | None = None) -> list[Document]:
        if not self._loaded or not self.chunks:
            return []

        candidates = self.chunks if lang is None else [c for c in self.chunks if c.metadata.get("language") == lang]
        if not candidates:
            return []

        texts = [d.page_content for d in candidates]
        matrix = self.vectorizer.transform(texts)
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, matrix).flatten()
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for idx in top_indices:
            if scores[idx] > 0:
                results.append(candidates[idx])

        return results


class CachedRAG:
    def __init__(self):
        self._cache = {}

    def search(self, query: str, k: int = 3, lang: str | None = None) -> list[Document]:
        key = (query.strip().lower(), k, lang)
        if key not in self._cache:
            store = get_vector_store()
            self._cache[key] = store.similarity_search(query, k=k, lang=lang)
        return self._cache[key]


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
