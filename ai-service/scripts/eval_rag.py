"""Evalúa la recuperación RAG con un conjunto fijo de consultas (es/en/de).

Uso:  python scripts/eval_rag.py [--k 3] [--json]

Métricas:
- doc@1 / doc@3: el documento esperado aparece en la 1.ª / primeras 3 posiciones.
- lang@1: el primer fragmento está en el idioma de la consulta.
- answer@3: el dato esperado aparece en alguno de los 3 primeros fragmentos.
- MRR: rango recíproco medio del documento esperado.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from rag.vector_store import get_vector_store  # noqa: E402

QUERIES = json.loads((ROOT / "tests" / "data" / "rag_eval_queries.json").read_text(encoding="utf-8"))


def doc_id(d):
    return d.metadata.get("doc_id") or d.metadata["file"].rsplit(".", 2)[0]


def evaluate(search, k=3):
    rows = []
    for q in QUERIES:
        res = search(q["query"], q["lang"], k)
        ids = [doc_id(d) for d in res]
        rank = next((i + 1 for i, x in enumerate(ids) if x == q["doc"]), None)
        rows.append({
            "lang": q["lang"], "query": q["query"],
            "doc1": bool(ids) and ids[0] == q["doc"],
            "doc3": q["doc"] in ids[:3],
            "lang1": bool(res) and res[0].metadata.get("language") == q["lang"],
            "answer3": any(q["expect"] in d.page_content for d in res[:3]),
            "rr": 1 / rank if rank else 0.0,
        })
    return rows


def summary(rows):
    out = {}
    for lang in ("es", "en", "de", "all"):
        sel = [r for r in rows if lang == "all" or r["lang"] == lang]
        n = len(sel)
        out[lang] = {m: round(sum(r[m] for r in sel) / n, 3) for m in ("doc1", "doc3", "lang1", "answer3", "rr")}
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--k", type=int, default=3)
    ap.add_argument("--mode", default="current", help="current | all-languages")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    store = get_vector_store()
    if a.mode == "all-languages":
        search = lambda q, lang, k: store.similarity_search(q, k=k, lang=None)
    else:
        search = lambda q, lang, k: store.similarity_search(q, k=k, lang=lang) if "prefer_lang" not in store.similarity_search.__code__.co_varnames else store.similarity_search(q, k=k, prefer_lang=lang)
    rows = evaluate(search, a.k)
    if a.json:
        print(json.dumps({"summary": summary(rows), "rows": rows}, ensure_ascii=False, indent=2))
    else:
        for lang, m in summary(rows).items():
            print(f"{lang:>3}  doc@1={m['doc1']:.2f}  doc@3={m['doc3']:.2f}  lang@1={m['lang1']:.2f}  answer@3={m['answer3']:.2f}  MRR={m['rr']:.2f}")
        fails = [r for r in rows if not r["doc1"]]
        if fails:
            print("\nFallos doc@1:")
            for r in fails:
                print(f"  [{r['lang']}] {r['query']}")
