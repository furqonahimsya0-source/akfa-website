#!/bin/bash
cd /home/z/my-project
while true; do
  if ! curl -s -o /dev/null -w "" http://localhost:3000/ 2>/dev/null; then
    echo "[$(date)] Server down, restarting..." >> /tmp/server-keepalive.log
    pkill -f "next dev" 2>/dev/null
    sleep 2
    NODE_OPTIONS="--max-old-space-size=256" npx next dev -p 3000 > /tmp/next-server.log 2>&1 &
  fi
  sleep 10
done
