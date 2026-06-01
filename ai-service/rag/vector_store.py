from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from functools import lru_cache

from config import get_settings

COLLECTION_NAME = "adastra_sky_docs"


@lru_cache()
def get_embedding_function():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


@lru_cache()
def get_vector_store():
    settings = get_settings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embedding_function(),
        persist_directory=settings.chroma_persist_dir,
    )


def get_retriever(top_k: int = 3):
    store = get_vector_store()
    return store.as_retriever(search_kwargs={"k": top_k})
