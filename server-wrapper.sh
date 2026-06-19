#!/bin/bash
# Keepalive wrapper for Next.js server
cd /home/z/my-project

# Kill any existing server
pkill -f "server.js" 2>/dev/null
sleep 1

echo "[$(date)] Starting keepalive server wrapper" > server-wrapper.log

while true; do
  echo "[$(date)] Starting server..." >> server-wrapper.log
  NODE_OPTIONS="--max-old-space-size=256" node .next/standalone/server.js >> server-wrapper.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..." >> server-wrapper.log
  sleep 2
done
