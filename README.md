# HRMS Platform

Full-stack Human Resource Management System with web and mobile clients.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, Celery |
| Web | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Mobile | React Native, Expo SDK 52, Expo Router, NativeWind |
| Database | PostgreSQL 16, Redis 7 |
| Shared | TypeScript types/enums in `packages/shared` |

## Project Structure

```
hrms/
├── api/                  # FastAPI backend
├── web/                  # React + Vite frontend
├── mobile/               # React Native Expo app
├── packages/shared/      # Shared TypeScript types & enums
├── docker-compose.yml    # Production-like services
├── docker-compose.dev.yml# Dev overrides (hot reload, volumes)
└── Makefile              # Common commands
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.12+
- Node.js 20+ / Bun
- Expo CLI (`npm install -g expo-cli`)

### Setup

```bash
# 1. Clone and install everything
make setup

# 2. Run database migrations
make migrate

# 3. Seed initial data (roles, permissions, demo company)
make seed

# 4. Start infrastructure (DB, Redis, MailHog)
make dev

# 5. In separate terminals:
make dev-api     # Backend on :8000
make dev-web     # Web on :5173
make dev-mobile  # Expo on :8081
```

### Services

| Service | URL |
|---------|-----|
| API (Swagger) | http://localhost:8000/docs |
| Web App | http://localhost:5173 |
| MailHog (dev email) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Commands

```bash
make dev           # Start DB + Redis + MailHog
make dev-api       # Run API with hot reload
make dev-web       # Run web with Vite HMR
make dev-mobile    # Run Expo dev server

make test          # Run all tests
make test-api      # Run backend tests
make test-web      # Run frontend tests

make migrate       # Run database migrations
make seed          # Seed initial data
make build         # Docker build all services
make clean         # Stop containers, remove volumes

make format        # Format all code
make lint          # Lint all code
```

## Modules

- Authentication & RBAC (JWT, MFA, role hierarchy)
- Employee Management (lifecycle, documents, org chart)
- Attendance (GPS check-in, geofencing, shifts)
- Leave Management (policies, allocations, approvals)
- Payroll (salary structures, payslips, tax declarations)
- Recruitment (ATS, pipeline, interviews, offers)
- OKR System (cycles, objectives, key results, check-ins)
- Performance Management (review cycles, 360 feedback, PIP)
- Task Management (Kanban, assignments, templates)
- Assessments (question banks, timed exams)
