#!/usr/bin/env bash
# Script Supervisor 24/7 - Club Casalzaum Takeshi Bot
cd "$(dirname "$0")"

echo "=========================================================="
echo "👑 TAKESHI BOT 24/7 - SERVIÇO CONTÍNUO ININTERRUPTO"
echo "=========================================================="

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Subindo Takeshi Bot..."
  node ./src/index.js
  EXIT_CODE=$?
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processo encerrou com código $EXIT_CODE. Reiniciando em 2 segundos..."
  sleep 2
done
