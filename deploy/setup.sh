#!/bin/bash
set -e

echo "=== HRMS Demo Server Setup ==="

# Update system
apt-get update -y
apt-get install -y nginx nodejs npm git certbot python3-certbot-nginx

# Install Node 20 LTS if not present
if ! node -v 2>/dev/null | grep -q "v20\|v22"; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Clone or update repo
if [ -d /opt/hrms ]; then
    cd /opt/hrms && git pull
else
    git clone https://github.com/SMBCATALYST2/hrms.git /opt/hrms
fi

cd /opt/hrms

# Create .env for API
cat > api/.env << 'ENVEOF'
DATABASE_URL=postgresql+asyncpg://hrms:hrms_demo_secure_2024@db:5432/hrms
DATABASE_POOL_SIZE=5
DATABASE_ECHO=false
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
JWT_SECRET_KEY=hrms-demo-jwt-secret-key-change-in-production-2024
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
FIELD_ENCRYPTION_KEY=
S3_ENDPOINT_URL=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=hrms
S3_REGION=ap-south-1
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@hrms.demo
SMTP_USE_TLS=false
ANTHROPIC_API_KEY=
AI_MODEL=
APP_NAME=HRMS Demo
APP_ENV=production
APP_DEBUG=false
CORS_ORIGINS=http://demo.hrms.smbnext.in,https://demo.hrms.smbnext.in
API_V1_PREFIX=/api/v1
ENVEOF

# Update docker-compose postgres password to match
sed -i 's/hrms_dev_password/hrms_demo_secure_2024/g' docker-compose.yml

# Update CORS in docker-compose
sed -i 's|"http://localhost:5173","http://localhost:8081"|"http://demo.hrms.smbnext.in","https://demo.hrms.smbnext.in"|g' docker-compose.yml

# Remove --reload for production
sed -i 's/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2/g' docker-compose.yml

# Build and start backend services
echo "=== Starting Docker services ==="
docker compose up -d db redis mailhog
sleep 10

# Build API
docker compose build api
docker compose up -d api

# Wait for API to be ready
echo "Waiting for API..."
for i in $(seq 1 30); do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "API is ready!"
        break
    fi
    sleep 2
done

# Run seed (create tables + seed data)
echo "=== Seeding database ==="
docker compose exec -T api python -m app.scripts.seed || echo "Seed may need retry..."

# Build web frontend
echo "=== Building web frontend ==="
cd /opt/hrms/web
npm install

# Create production .env for web
cat > .env.production << 'WEBENVEOF'
VITE_API_URL=
WEBENVEOF

npm run build

# Deploy web build
mkdir -p /var/www/hrms/web
cp -r dist/* /var/www/hrms/web/

# Setup Nginx
cp /opt/hrms/deploy/nginx.conf /etc/nginx/sites-available/hrms
ln -sf /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/hrms
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo ""
echo "=== HRMS Demo Deployment Complete ==="
echo ""
echo "Web App:  http://demo.hrms.smbnext.in"
echo "API Docs: http://demo.hrms.smbnext.in/api/docs"
echo "MailHog:  http://demo.hrms.smbnext.in/mailhog/"
echo ""
echo "Demo Accounts (password: Admin@123):"
echo "  super_admin  | admin@hrms.demo"
echo "  hr_admin     | hr@hrms.demo"
echo "  manager      | manager@hrms.demo"
echo "  employee     | employee@hrms.demo"
echo "  recruiter    | recruiter@hrms.demo"
echo "  finance      | finance@hrms.demo"
echo ""
