@echo off
echo ========================================================
echo   OPERA - Development Mode (Vite + FastAPI)
echo ========================================================
cd /d "%~dp0"
set "PATH=%~dp0.tools\node;%PATH%"
set "PYTHONPATH=%~dp0backend"

start "OPERA Backend" cmd /k ""%~dp0.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul

cd frontend
start "OPERA Frontend (Vite)" cmd /k "npm run dev"

echo.
echo Both servers are launching!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo.
pause
