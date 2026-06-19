#!/bin/bash
cd /home/z/my-project

# Create upload directories
mkdir -p public/uploads/images public/uploads/videos public/uploads/docs public/uploads/audio

echo "[$(date)] Starting AKFA services..."

# Start Bun upload microservice
cd /home/z/my-project/mini-services/upload-service
bun index.ts > /tmp/upload-svc.log 2>&1 &
UPLOAD_PID=$!
echo "[$(date)] Upload service PID: $UPLOAD_PID on port 4001"

# Start Next.js dev server
cd /home/z/my-project
NODE_OPTIONS="--max-old-space-size=256" npx next dev -p 3000 > /tmp/next-srv.log 2>&1 &
NEXT_PID=$!
echo "[$(date)] Next.js PID: $NEXT_PID on port 3000"

# Keepalive loop — check every 8 seconds, restart if dead
while true; do
  sleep 8

  # Check Next.js
  if ! curl -s -o /dev/null -w "" http://localhost:3000/ 2>/dev/null; then
    echo "[$(date)] Next.js DOWN, restarting..." >> /tmp/keepalive.log

    # Kill zombie processes
    pkill -f "next dev" 2>/dev/null
    pkill -f "node.*next" 2>/dev/null
    sleep 2

    # Clear cache and restart
    rm -rf /home/z/my-project/.next
    cd /home/z/my-project
    NODE_OPTIONS="--max-old-space-size=256" npx next dev -p 3000 > /tmp/next-srv.log 2>&1 &
    echo "[$(date)] Next.js restarted PID: $!" >> /tmp/keepalive.log
  fi

  # Check upload microservice
  if ! curl -s -o /dev/null -w "" http://localhost:4001/health 2>/dev/null; then
    echo "[$(date)] Upload service DOWN, restarting..." >> /tmp/keepalive.log
    pkill -f "bun.*upload-service" 2>/dev/null
    sleep 2
    cd /home/z/my-project/mini-services/upload-service
    bun index.ts > /tmp/upload-svc.log 2>&1 &
    echo "[$(date)] Upload service restarted PID: $!" >> /tmp/keepalive.log
  fi
done
