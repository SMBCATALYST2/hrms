"""Employee service: CRUD with ID generation and search."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import PaginationParams
from app.models.employee import Employee
from app.schemas.common import PaginatedResponse
from app.schemas.employee import EmployeeCreate, EmployeeListItem, EmployeeResponse, EmployeeUpdate
from app.utils.id_generator import generate_employee_code
from app.utils.pagination import paginate


async def create_employee(db: AsyncSession, data: EmployeeCreate, created_by: UUID | None = None) -> Employee:
    """Create a new employee with auto-generated employee code."""
    employee_code = await generate_employee_code(db)

    employee = Employee(
        employee_code=employee_code,
        created_by=created_by,
        **data.model_dump(),
    )
    db.add(employee)
    await db.flush()
    await db.refresh(employee)
    return employee


async def get_employee(db: AsyncSession, employee_id: UUID) -> Employee:
    """Fetch a single employee by ID, raising 404 if not found."""
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


async def update_employee(
    db: AsyncSession, employee_id: UUID, data: EmployeeUpdate, updated_by: UUID | None = None,
) -> Employee:
    """Update an existing employee record."""
    employee = await get_employee(db, employee_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    if updated_by:
        employee.updated_by = updated_by
    await db.flush()
    await db.refresh(employee)
    return employee


async def delete_employee(db: AsyncSession, employee_id: UUID) -> None:
    """Soft-delete an employee by setting status to 'terminated'."""
    employee = await get_employee(db, employee_id)
    employee.status = "terminated"
    await db.flush()


async def list_employees(
    db: AsyncSession,
    params: PaginationParams,
    company_id: UUID | None = None,
    department_id: UUID | None = None,
    status_filter: str | None = None,
) -> PaginatedResponse[EmployeeListItem]:
    """List employees with search, filters, and pagination."""
    query = select(Employee)

    if company_id:
        query = query.where(Employee.company_id == company_id)
    if department_id:
        query = query.where(Employee.department_id == department_id)
    if status_filter:
        query = query.where(Employee.status == status_filter)
    if params.search:
        search_term = f"%{params.search}%"
        query = query.where(
            or_(
                Employee.first_name.ilike(search_term),
                Employee.last_name.ilike(search_term),
                Employee.email.ilike(search_term),
                Employee.employee_code.ilike(search_term),
            )
        )

    return await paginate(db, query, params, EmployeeListItem)
