"""
Script de ingesta de documentos para ChromaDB.
Ejecutar: python -m rag.ingest
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from pathlib import Path
from langchain_core.documents import Document
from rag.vector_store import get_vector_store

DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"


def load_documents() -> list[Document]:
    docs = []
    if not DOCUMENTS_DIR.exists():
        print(f"[WARN] Directorio de documentos no encontrado: {DOCUMENTS_DIR}")
        return docs

    for md_file in sorted(DOCUMENTS_DIR.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        title = md_file.stem.replace("_", " ").replace("-", " ").title()
        docs.append(
            Document(
                page_content=content,
                metadata={
                    "source": "Documento IAC",
                    "title": title,
                    "file": md_file.name,
                },
            )
        )
        print(f"  [OK] {md_file.name}")
    return docs


def ingest():
    print("[INFO] Cargando documentos...")
    documents = load_documents()

    if not documents:
        print("[ERROR] No hay documentos para ingestar")
        return

    print(f"[INFO] {len(documents)} documentos cargados")
    print("[INFO] Generando embeddings e ingentando en ChromaDB...")

    store = get_vector_store()
    store.add_documents(documents)

    print(f"[OK] Ingesta completada. {len(documents)} documentos en la coleccion.")


if __name__ == "__main__":
    ingest()
