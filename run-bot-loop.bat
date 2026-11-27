@echo off
cd /d C:\Projetos\rian-bot-zap
:loop
node ./src/index.js >> C:\Projetos\rian-bot-zap\bot-247.log 2>&1
timeout /t 3 /nobreak >nul
goto loop
