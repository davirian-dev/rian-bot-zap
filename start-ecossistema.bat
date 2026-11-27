@echo off
start "Portal Noticias Liberal" /min cmd /c "cd /d C:\Projetos\portal-noticias-liberal\backend && python -m uvicorn app.main:app --port 8080"
timeout /t 3 /nobreak >nul
start "Rian Bot Zap" /min C:\Projetos\rian-bot-zap\run-bot-loop.bat
