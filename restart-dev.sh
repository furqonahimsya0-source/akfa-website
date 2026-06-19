#!/bin/bash
# Auto-restart dev server for AKFA
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting dev server..."
  NODE_OPTIONS="--max-old-space-size=320" npx next dev -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
