"""Shift routes: types CRUD, assignments."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.attendance import Shift, ShiftAssignment
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.shift import (
    ShiftAssignmentCreate,
    ShiftAssignmentResponse,
    ShiftTypeCreate,
    ShiftTypeResponse,
    ShiftTypeUpdate,
)
from app.utils.pagination import paginate

router = APIRouter()

_PLACEHOLDER_TENANT = UUID("00000000-0000-0000-0000-000000000000")


@router.get("/types", response_model=PaginatedResponse[ShiftTypeResponse])
async def list_shift_types(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List shift types."""
    query = select(Shift)
    if company_id:
        query = query.where(Shift.company_id == company_id)
    return await paginate(db, query, params, ShiftTypeResponse)


@router.post("/types", response_model=ShiftTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_shift_type(
    data: ShiftTypeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a new shift type."""
    shift = Shift(tenant_id=_PLACEHOLDER_TENANT, **data.model_dump())
    db.add(shift)
    await db.flush()
    await db.refresh(shift)
    return ShiftTypeResponse.model_validate(shift)


@router.patch("/types/{shift_id}", response_model=ShiftTypeResponse)
async def update_shift_type(
    shift_id: UUID,
    data: ShiftTypeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a shift type."""
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift type not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(shift, field, value)
    await db.flush()
    await db.refresh(shift)
    return ShiftTypeResponse.model_validate(shift)


@router.delete("/types/{shift_id}", response_model=SuccessResponse)
async def delete_shift_type(
    shift_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Deactivate a shift type."""
    result = await db.execute(select(Shift).where(Shift.id == shift_id))
    shift = result.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift type not found")
    shift.is_active = False
    await db.flush()
    return SuccessResponse(message="Shift type deactivated")


@router.post("/assignments", response_model=ShiftAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shift_assignment(
    data: ShiftAssignmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Assign an employee to a shift."""
    assignment = ShiftAssignment(**data.model_dump())
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    return ShiftAssignmentResponse.model_validate(assignment)


@router.get("/assignments", response_model=PaginatedResponse[ShiftAssignmentResponse])
async def list_shift_assignments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    employee_id: UUID | None = Query(default=None),
):
    """List shift assignments."""
    query = select(ShiftAssignment)
    if employee_id:
        query = query.where(ShiftAssignment.employee_id == employee_id)
    return await paginate(db, query, params, ShiftAssignmentResponse)
