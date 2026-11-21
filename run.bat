@echo off
echo ========================================================
echo   Starting OPERA - Intelligent Operations Assistant
echo ========================================================
echo.
cd /d "%~dp0"

echo 1. Activating Python virtual environment...
set "PYTHONPATH=%~dp0backend"

echo 2. Launching FastAPI Application Server on http://127.0.0.1:8000 ...
echo    - Web UI: http://127.0.0.1:8000/
echo    - Swagger API Docs: http://127.0.0.1:8000/docs
echo.
"%~dp0.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
