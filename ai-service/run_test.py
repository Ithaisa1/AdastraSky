"""Start AI service and test Groq integration."""
import subprocess, sys, time, httpx, os

BASE = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE)

# Verify config
from config import get_settings
s = get_settings()
print(f"[SETTINGS] GROQ key set: {bool(s.groq_api_key)}, model: {s.groq_model}")
print(f"[SETTINGS] CWD: {os.getcwd()}")

# Test _build_model directly
from agent.agent import _build_model
m = _build_model()
print(f"[BUILD] Model: {type(m).__name__ if m else 'None'}")
if m:
    print(f"[BUILD] Model name: {m.model_name}")

# Start server
print("\n[START] Starting server...")
p = subprocess.Popen([sys.executable, "main.py"], cwd=BASE)
time.sleep(40)

print("[TEST] Testing health...")
r = httpx.get("http://localhost:8001/health", timeout=5)
print(f"  {r.status_code} {r.json()}")

print("[TEST] Chat: joke (expect LLM response)...")
r = httpx.post("http://localhost:8001/api/chat",
    json={"message": "Cuéntame un chiste corto de astronomía"},
    timeout=120)
data = r.json()
clean = "".join(c if 32 <= ord(c) < 128 else " " for c in data["response"])
print(f"  Status: {r.status_code}")
print(f"  {clean[:500]}...")

if "chiste" in clean.lower() or "astrónomo" in clean.lower() or "joke" in clean.lower():
    print("  >>> GROQ ACTIVO <<<")
else:
    print("  >>> RAG FALLBACK (Groq NO activo) <<<")

p.kill()
print("\nDone")
