"""Leave routes: types CRUD, applications CRUD, allocations, balance, approve/reject."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.leave import LeaveApplication, LeaveType
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.leave import (
    LeaveActionRequest,
    LeaveAllocationCreate,
    LeaveApplicationCreate,
    LeaveApplicationResponse,
    LeaveApplicationUpdate,
    LeaveBalanceResponse,
    LeaveTypeCreate,
    LeaveTypeResponse,
    LeaveTypeUpdate,
)
from app.services.leave_service import (
    allocate_leave,
    apply_leave,
    approve_leave,
    get_all_balances,
    reject_leave,
)
from app.utils.pagination import paginate

router = APIRouter()

_PLACEHOLDER_TENANT = UUID("00000000-0000-0000-0000-000000000000")


# --- Leave Types ---

@router.get("/types", response_model=PaginatedResponse[LeaveTypeResponse])
async def list_leave_types(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List leave types."""
    query = select(LeaveType)
    if company_id:
        query = query.where(LeaveType.company_id == company_id)
    return await paginate(db, query, params, LeaveTypeResponse)


@router.post("/types", response_model=LeaveTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_type(
    data: LeaveTypeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a new leave type."""
    lt = LeaveType(tenant_id=_PLACEHOLDER_TENANT, **data.model_dump())
    db.add(lt)
    await db.flush()
    await db.refresh(lt)
    return LeaveTypeResponse.model_validate(lt)


@router.patch("/types/{leave_type_id}", response_model=LeaveTypeResponse)
async def update_leave_type(
    leave_type_id: UUID,
    data: LeaveTypeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a leave type."""
    result = await db.execute(select(LeaveType).where(LeaveType.id == leave_type_id))
    lt = result.scalar_one_or_none()
    if not lt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave type not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lt, field, value)
    await db.flush()
    await db.refresh(lt)
    return LeaveTypeResponse.model_validate(lt)


# --- Leave Applications ---

@router.post("/applications", response_model=LeaveApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_application(
    data: LeaveApplicationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit a leave application."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    app = await apply_leave(
        db, _PLACEHOLDER_TENANT, current_user.employee_id,
        data.leave_type_id, data.from_date, data.to_date,
        data.from_half, data.to_half, data.reason,
    )
    return LeaveApplicationResponse.model_validate(app)


@router.get("/applications", response_model=PaginatedResponse[LeaveApplicationResponse])
async def list_leave_applications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    employee_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
):
    """List leave applications."""
    query = select(LeaveApplication)
    if employee_id:
        query = query.where(LeaveApplication.employee_id == employee_id)
    elif current_user.employee_id:
        query = query.where(LeaveApplication.employee_id == current_user.employee_id)
    if status_filter:
        query = query.where(LeaveApplication.status == status_filter)
    return await paginate(db, query, params, LeaveApplicationResponse)


@router.patch("/applications/{application_id}/action", response_model=LeaveApplicationResponse)
async def action_leave_application(
    application_id: UUID,
    data: LeaveActionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Approve or reject a leave application."""
    if data.status == "approved":
        app = await approve_leave(db, application_id, current_user.id)
    else:
        app = await reject_leave(db, application_id, current_user.id, data.rejection_reason)
    return LeaveApplicationResponse.model_validate(app)


# --- Leave Balance ---

@router.get("/balance", response_model=list[LeaveBalanceResponse])
async def get_leave_balances(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    year: int = Query(...),
    employee_id: UUID | None = Query(default=None),
):
    """Get leave balances for an employee."""
    emp_id = employee_id or current_user.employee_id
    if not emp_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No employee specified")
    balances = await get_all_balances(db, emp_id, year)
    return [LeaveBalanceResponse.model_validate(b) for b in balances]


# --- Leave Allocation ---

@router.post("/allocations", response_model=LeaveBalanceResponse, status_code=status.HTTP_201_CREATED)
async def create_leave_allocation(
    data: LeaveAllocationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Allocate leave balance to an employee."""
    balance = await allocate_leave(
        db, _PLACEHOLDER_TENANT, data.employee_id,
        data.leave_type_id, data.year, data.allocated,
    )
    return LeaveBalanceResponse.model_validate(balance)
