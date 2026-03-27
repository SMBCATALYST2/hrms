"""Employee routes: full CRUD + list with search/filter/pagination."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.employee import EmployeeCreate, EmployeeListItem, EmployeeResponse, EmployeeUpdate
from app.services.employee_service import (
    create_employee,
    delete_employee,
    get_employee,
    list_employees,
    update_employee,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse[EmployeeListItem])
async def list_employees_route(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
    department_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
):
    """List employees with optional filters, search, and pagination."""
    return await list_employees(db, params, company_id, department_id, status_filter)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_route(
    data: EmployeeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Create a new employee record."""
    employee = await create_employee(db, data, created_by=current_user.id)
    return EmployeeResponse.model_validate(employee)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee_route(
    employee_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single employee by ID."""
    employee = await get_employee(db, employee_id)
    return EmployeeResponse.model_validate(employee)


@router.patch("/{employee_id}", response_model=EmployeeResponse)
async def update_employee_route(
    employee_id: UUID,
    data: EmployeeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Update an existing employee record."""
    employee = await update_employee(db, employee_id, data, updated_by=current_user.id)
    return EmployeeResponse.model_validate(employee)


@router.delete("/{employee_id}", response_model=SuccessResponse)
async def delete_employee_route(
    employee_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Soft-delete an employee (set status to terminated)."""
    await delete_employee(db, employee_id)
    return SuccessResponse(message="Employee deleted successfully")
