#!/usr/bin/env python3
"""
Скрипт запуска FastAPI Business Platform Backend
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Настройки для разработки
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info",
        access_log=True,
    )
