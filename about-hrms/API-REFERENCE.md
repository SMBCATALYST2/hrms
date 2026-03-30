# HRMS API Reference

Base URL: `http://<server>:8000/api/v1`
Auth: `Authorization: Bearer <jwt_token>`
Docs: `http://<server>:8000/docs` (Swagger UI)

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login with email/password |
| POST | /auth/register | Create new account |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout (client-side) |
| GET | /auth/me | Get current user profile |

## Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /employees | List employees (paginated) |
| GET | /employees/{id} | Get employee details |
| POST | /employees | Create employee |
| PUT | /employees/{id} | Update employee |
| DELETE | /employees/{id} | Soft delete employee |

## Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /attendance/check-in | GPS check-in |
| POST | /attendance/check-out | Check-out |
| GET | /attendance | List attendance records |
| GET | /attendance/{date} | Daily attendance |

## Leaves

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /leaves/balance | Get leave balance |
| POST | /leaves/request | Apply for leave |
| GET | /leaves/request/{id} | Leave request details |
| PUT | /leaves/request/{id}/approve | Approve leave |
| PUT | /leaves/request/{id}/reject | Reject leave |

## Payroll

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /payroll/structures | List salary structures |
| POST | /payroll/run | Process payroll |
| GET | /payroll/payslips | List payslips |
| GET | /payroll/payslips/{id} | Payslip details |
| POST | /payroll/tax-declaration | File tax declaration |

## Recruitment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /jobs/openings | List job openings |
| POST | /jobs/openings | Create job opening |
| POST | /jobs/openings/{id}/description | AI-generate job description |
| GET | /jobs/{id}/applications | List applications |

## Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /interviews/schedule | Schedule interview |
| GET | /interviews | List interviews |
| POST | /interviews/{id}/feedback | Add feedback |

## Offers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /offers | Create offer |
| GET | /offers/{id} | Offer details |
| PUT | /offers/{id}/approve | Approve offer |
| POST | /offers/{id}/send | Send offer letter |

## OKR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /okr/cycles | Create OKR cycle |
| POST | /okr/cycles/{id}/activate | Activate cycle |
| POST | /okr/objectives | Create objective |
| POST | /okr/key-results | Create key result |
| POST | /okr/check-ins | Add check-in |

## Performance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /performance/cycles | List review cycles |
| POST | /performance/reviews | Create review |
| POST | /performance/reviews/{id}/feedback | Add 360 feedback |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | List tasks (Kanban) |
| POST | /tasks | Create task |
| PUT | /tasks/{id} | Update task |

## Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /assessments | List assessments |
| POST | /assessments | Create assessment |
| POST | /assessments/{id}/assign | Assign assessment |
| POST | /assessments/{id}/submit | Submit answers |

## Organization

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /companies | List/create companies |
| GET/POST | /departments | List/create departments |
| GET/POST | /designations | List/create designations |
| GET/POST | /shifts | List/create shifts |
| GET/POST | /holidays | List/create holidays |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | List notifications |
| PUT | /notifications/{id}/read | Mark as read |
| DELETE | /notifications/{id} | Delete notification |

---

## Pagination

All list endpoints support:
- `page` (default: 1)
- `page_size` (default: 20)
- `sort_by` (field name)
- `sort_order` (asc/desc)
- `search` (text search)

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 423 | Account Locked |
| 500 | Server Error |
