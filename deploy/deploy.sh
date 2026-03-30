#!/bin/bash
set -e

echo "=== HRMS Deploy Started ==="
cd /opt/hrms

# Pull latest code
git fetch origin main
git reset --hard origin/main

# Apply production patches
sed -i 's/libgdk-pixbuf2.0-0/libgdk-pixbuf-2.0-0/' api/Dockerfile
sed -i 's/hrms_dev_password/hrms_demo_secure_2024/g' docker-compose.yml
sed -i 's/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2/g' docker-compose.yml

# Rebuild and restart API
echo "=== Rebuilding API ==="
docker compose build api
docker compose up -d api

# Wait for API health
echo "Waiting for API..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "API healthy"
        break
    fi
    sleep 2
done

# Rebuild frontend
echo "=== Building frontend ==="
cd /opt/hrms/web
sed -i 's#import.meta.env.VITE_API_URL || "http://localhost:8000"#""#' src/lib/constants.ts
npm install --silent 2>&1 | tail -1
npx vite build 2>&1 | tail -3

# Deploy frontend
rm -rf /var/www/hrms/web/*
cp -r dist/* /var/www/hrms/web/
systemctl reload nginx

echo "=== Deploy Complete ==="
