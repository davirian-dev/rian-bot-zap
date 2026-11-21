#!/bin/bash
cd /home/daviemari/.gemini/antigravity/scratch/takeshi-bot
while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando Takeshi Bot..." >> daemon.log
    node ./src/index.js >> daemon.log 2>&1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processo encerrou, reiniciando em 2s..." >> daemon.log
    sleep 2
done
