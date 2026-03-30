# HRMS - Human Resource Management System

## Overview

HRMS is a production-grade, full-stack Human Resource Management System built for modern organizations. It provides comprehensive HR functionality across web and mobile platforms with enterprise-grade security and multi-tenant architecture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python 3.12), SQLAlchemy 2.0 (async), Celery |
| **Frontend (Web)** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Frontend (Mobile)** | React Native, Expo SDK 52, NativeWind |
| **Database** | PostgreSQL 16 (async via asyncpg) |
| **Cache & Queue** | Redis 7 (caching + Celery broker) |
| **Auth** | JWT (Bearer tokens), MFA (TOTP), Biometric (mobile) |
| **AI** | Anthropic Claude API (job description generation) |
| **Deployment** | Docker & Docker Compose |
| **File Storage** | S3-compatible (AWS S3 / MinIO) |
| **Email** | SMTP (MailHog for dev) |

---

## Modules

### 1. Authentication & Access Control
- JWT-based authentication with Bearer tokens
- Role-Based Access Control (RBAC) with hierarchy: super_admin, hr_admin, manager, employee, recruiter, finance_admin
- Multi-Factor Authentication (MFA) via TOTP
- Biometric login on mobile (Face ID, Fingerprint)
- Account lockout after 5 failed attempts (30-min cooldown)
- Token lifecycle: access (15 min), refresh (7 days)

### 2. Employee Management
- Comprehensive employee records (30+ fields)
- Personal, contact, organization, employment, financial, and emergency details
- Employee lifecycle: draft > active > on_notice > suspended > resigned > relieved > terminated
- Organizational chart visualization
- Self-service portal
- PII encryption (Aadhaar, PAN)

### 3. Attendance System
- GPS-based check-in/check-out with coordinate tracking
- Geofencing (verify employee proximity to office)
- Shift management with multiple shift definitions
- Late/early arrival detection
- Mobile-first with deep location services integration

### 4. Leave Management
- Configurable leave policies per company
- Leave types: Annual, Sick, Casual, Maternity, etc.
- Automatic leave allocation based on policies
- Leave balance tracking and carry-forward rules
- Manager approval/rejection workflow

### 5. Payroll System
- Multi-component salary structure (Basic, HRA, DA, allowances, deductions)
- Automated payroll processing via background jobs
- Tax calculations and declarations
- Payslip generation (PDF & Excel export)
- Annual tax consolidation

### 6. Recruitment (ATS)
- Job opening creation and management
- AI-assisted job description generation (Claude API)
- Application tracking pipeline
- Interview scheduling with feedback and ratings (1-5 scale)
- Offer generation, approval, and letter dispatch

### 7. OKR System (Objectives & Key Results)
- OKR cycle management (quarterly, annual)
- Objective hierarchy: company > department > individual
- Key result tracking with progress metrics
- Check-in capability during active cycles
- Alignment visualization

### 8. Performance Management
- Multi-cycle performance reviews
- 360-degree feedback system
- Performance ratings and improvement plans (PIP)
- Review templates

### 9. Task Management
- Kanban board view
- Task list with priority, status, and due dates
- Task assignment and activity tracking
- Task templates

### 10. Assessments
- Question bank creation
- Timed exams/assessments
- Multiple question types (MCQ, etc.)
- Employee/candidate assignment
- Results tracking

---

## Architecture

```
                    +------------------+
                    |   React Web App  |  (Port 5173)
                    |  TypeScript/Vite |
                    +--------+---------+
                             |
                    +--------+---------+
                    | React Native App |  (Expo)
                    |   iOS / Android  |
                    +--------+---------+
                             |
                    +--------v---------+
                    |   FastAPI (API)  |  (Port 8000)
                    |   Python 3.12   |
                    +--+-----+-----+--+
                       |     |     |
              +--------+  +--+--+  +--------+
              |           |     |           |
     +--------v--+  +-----v-+  +v--------+ |
     |PostgreSQL |  | Redis |  | Celery  | |
     |   16      |  |   7   |  | Workers | |
     +-----------+  +-------+  +---------+ |
                                           |
                               +-----------v--+
                               | S3 / MinIO   |
                               | File Storage |
                               +--------------+
```

---

## Project Structure

```
hrms/
├── api/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints (15 modules)
│   │   ├── models/         # SQLAlchemy ORM models (20 modules)
│   │   ├── schemas/        # Pydantic DTOs
│   │   ├── services/       # Business logic (11 services)
│   │   ├── core/           # Config, database, security, dependencies
│   │   └── utils/          # Pagination, ID generation
│   ├── alembic/            # Database migrations
│   ├── tests/              # pytest test suite
│   └── Dockerfile          # Multi-stage Python build
├── web/                    # React + Vite Frontend
│   ├── src/
│   │   ├── features/       # Feature modules (auth, employees, payroll, etc.)
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── mobile/                 # React Native + Expo
│   ├── app/                # Expo Router screens
│   ├── components/         # RN components
│   ├── services/           # API, geolocation, notifications
│   └── store/              # Zustand state
├── packages/shared/        # Shared TypeScript types
├── docker-compose.yml      # Production services
├── docker-compose.dev.yml  # Dev overrides
└── Makefile                # Dev commands
```

---

## Services & Ports

| Service | Port | URL |
|---------|------|-----|
| API (Swagger) | 8000 | http://localhost:8000/docs |
| Web App | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| MailHog UI | 8025 | http://localhost:8025 |
| MailHog SMTP | 1025 | localhost:1025 |

---

## Key Features Summary

- **Multi-Tenant**: Company-level data isolation
- **Audit Trail**: created_by, updated_by timestamps on all records
- **Soft Deletes**: Logical deletion with recovery capability
- **Async-First**: asyncpg, async SQLAlchemy, async SMTP
- **Background Jobs**: Celery workers for payroll processing, emails, reports
- **Document Generation**: PDF (WeasyPrint), Excel (Openpyxl)
- **AI-Powered**: Claude API for job descriptions
- **Mobile-Ready**: Full-featured React Native app with biometric auth and GPS
- **Security**: JWT + MFA + PII encryption + RBAC + account lockout

---

## Roles & Permissions

| Role | Description |
|------|-------------|
| super_admin | Full system access, tenant management |
| hr_admin | HR operations, employee management, payroll |
| manager | Team management, approvals, performance reviews |
| employee | Self-service: attendance, leaves, tasks, profile |
| recruiter | Job postings, candidate management, interviews |
| finance_admin | Payroll processing, tax management, reports |

---

## Environment Requirements

- Docker & Docker Compose
- Python 3.12+ (for local API development)
- Node.js 18+ (for web/mobile development)
- PostgreSQL 16
- Redis 7
