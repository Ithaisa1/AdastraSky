"""
RAG ligero en memoria — TF-IDF + cosine similarity.
Sin ChromaDB, sin sentence-transformers, sin torch.
Carga los 6 documentos IAC al importar.
"""

import re
from pathlib import Path
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"


class Document:
    def __init__(self, page_content: str, metadata: dict):
        self.page_content = page_content
        self.metadata = metadata


class InMemoryVectorStore:
    def __init__(self):
        self.chunks: list[Document] = []
        self.vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words="spanish",
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
            title = md_file.stem.replace("_", " ").replace("-", " ").title()
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", content) if p.strip()]

            for para in paragraphs:
                self.chunks.append(
                    Document(
                        page_content=para,
                        metadata={
                            "source": "Documento IAC",
                            "title": title,
                            "file": md_file.name,
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

    def similarity_search(self, query: str, k: int = 3) -> list[Document]:
        if not self._loaded or not self.chunks:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self._tfidf_matrix).flatten()
        top_indices = np.argsort(scores)[::-1][:k]

        results = []
        for idx in top_indices:
            if scores[idx] > 0:
                results.append(self.chunks[idx])

        return results


@lru_cache()
def get_vector_store() -> InMemoryVectorStore:
    store = InMemoryVectorStore()
    store.load_documents()
    return store
