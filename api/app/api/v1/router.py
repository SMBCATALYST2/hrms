"""Main API v1 router including all module routers."""

from fastapi import APIRouter

from app.api.v1 import (
    assessments,
    attendance,
    auth,
    companies,
    departments,
    designations,
    employees,
    holidays,
    interviews,
    jobs,
    leaves,
    notifications,
    offers,
    okr,
    payroll,
    performance,
    shifts,
    tasks,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(designations.router, prefix="/designations", tags=["Designations"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(shifts.router, prefix="/shifts", tags=["Shifts"])
api_router.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
api_router.include_router(holidays.router, prefix="/holidays", tags=["Holidays"])
api_router.include_router(payroll.router, prefix="/payroll", tags=["Payroll"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Recruitment"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["Interviews"])
api_router.include_router(offers.router, prefix="/offers", tags=["Offers"])
api_router.include_router(okr.router, prefix="/okr", tags=["OKR"])
api_router.include_router(performance.router, prefix="/performance", tags=["Performance"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
