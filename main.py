"""
CAIRN ETP — Local FastAPI Server Launcher (main.py)
Run locally: python main.py
Website: cairnetp.com
"""

import sys
import uvicorn

if __name__ == "__main__":
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("[CAIRN ETP] Starting FastAPI Local Server at http://localhost:8000")
    print("[CAIRN ETP] Book Page available at http://localhost:8000/book")
    print("[CAIRN ETP] API Docs available at http://localhost:8000/docs")
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=False)
