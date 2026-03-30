# HRMS Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Domain name (optional, IP-based access works for demo)
- Minimum server: 2 vCPU, 2GB RAM (recommended: 2 vCPU, 4GB RAM)

---

## Quick Start (Docker Compose)

### 1. Clone the Repository
```bash
git clone https://github.com/SMBCATALYST2/hrms.git
cd hrms
```

### 2. Configure Environment
```bash
cp api/env-example.txt api/.env
```

Edit `api/.env` and set:
- `JWT_SECRET_KEY` - Generate: `openssl rand -hex 32`
- `FIELD_ENCRYPTION_KEY` - Generate: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- Other settings as needed

### 3. Start Infrastructure
```bash
docker compose up -d
```

### 4. Run Database Migrations
```bash
make migrate
```

### 5. Seed Initial Data
```bash
make seed
```

### 6. Access the Application
- Web: http://<server-ip>:5173
- API Docs: http://<server-ip>:8000/docs
- MailHog: http://<server-ip>:8025

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql+asyncpg://hrms:hrms_dev_password@db:5432/hrms | PostgreSQL connection |
| REDIS_URL | redis://redis:6379/0 | Redis connection |
| JWT_SECRET_KEY | dev-secret-key-change-in-production | **MUST CHANGE** in production |
| JWT_ACCESS_TOKEN_EXPIRE_MINUTES | 15 | Access token TTL |
| JWT_REFRESH_TOKEN_EXPIRE_DAYS | 7 | Refresh token TTL |
| FIELD_ENCRYPTION_KEY | (none) | Fernet key for PII encryption |
| CORS_ORIGINS | http://localhost:5173 | Allowed CORS origins |
| SMTP_HOST | mailpit | Email server host |
| SMTP_PORT | 1025 | Email server port |
| ANTHROPIC_API_KEY | (none) | Claude API key (optional) |
| S3_ENDPOINT_URL | http://minio:9000 | File storage endpoint |

---

## Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| db | postgres:16-alpine | 5432 | Primary database |
| redis | redis:7-alpine | 6379 | Cache & job broker |
| api | Custom (Dockerfile) | 8000 | FastAPI backend |
| celery-worker | Same as api | - | Background jobs |
| celery-beat | Same as api | - | Scheduled tasks |
| mailhog | mailhog/mailhog | 1025, 8025 | Dev email testing |

---

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make setup` | Install all dependencies |
| `make dev` | Start infrastructure (DB, Redis, MailHog) |
| `make dev-api` | Run API server locally |
| `make dev-web` | Run web frontend locally |
| `make dev-mobile` | Run mobile app locally |
| `make migrate` | Run database migrations |
| `make migrate-create` | Create new migration |
| `make seed` | Populate initial data |
| `make test` | Run all tests |
| `make build` | Build all containers |
| `make logs` | View container logs |
| `make clean` | Clean up containers and volumes |
| `make format` | Format code |
| `make lint` | Run linters |

---

## Production Considerations

1. **Change all default secrets** (JWT_SECRET_KEY, DB password, etc.)
2. **Enable HTTPS** via reverse proxy (Nginx/Caddy)
3. **Set CORS_ORIGINS** to your actual domain
4. **Configure proper SMTP** for email delivery
5. **Use managed PostgreSQL** for production workloads
6. **Enable backups** for database
7. **Set APP_ENV=production** and **APP_DEBUG=false**
8. **Configure S3** for file storage (or use managed MinIO)
