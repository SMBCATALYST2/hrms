"""Attendance routes: checkin, checkout, list, my-attendance, summary, regularize."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.attendance import AttendanceRecord, AttendanceRegularization
from app.models.user import User
from app.schemas.attendance import (
    AttendanceRecordResponse,
    AttendanceSummary,
    CheckInRequest,
    CheckOutRequest,
    RegularizationActionRequest,
    RegularizationRequest,
    RegularizationResponse,
)
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.services.attendance_service import (
    check_in,
    check_out,
    create_regularization,
    get_attendance_summary,
)
from app.utils.pagination import paginate

router = APIRouter()

# Placeholder tenant_id — in production this comes from the auth context
_PLACEHOLDER_TENANT = UUID("00000000-0000-0000-0000-000000000000")


@router.post("/checkin", response_model=AttendanceRecordResponse)
async def checkin_route(
    data: CheckInRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Check in the current employee."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    record = await check_in(db, current_user.employee_id, _PLACEHOLDER_TENANT, data)
    return AttendanceRecordResponse.model_validate(record)


@router.post("/checkout", response_model=AttendanceRecordResponse)
async def checkout_route(
    data: CheckOutRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Check out the current employee."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    record = await check_out(db, current_user.employee_id, _PLACEHOLDER_TENANT, data)
    return AttendanceRecordResponse.model_validate(record)


@router.get("", response_model=PaginatedResponse[AttendanceRecordResponse])
async def list_attendance(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
    params: Annotated[PaginationParams, Depends()],
    employee_id: UUID | None = Query(default=None),
):
    """List attendance records (HR/admin view)."""
    query = select(AttendanceRecord)
    if employee_id:
        query = query.where(AttendanceRecord.employee_id == employee_id)
    return await paginate(db, query, params, AttendanceRecordResponse)


@router.get("/my-attendance", response_model=PaginatedResponse[AttendanceRecordResponse])
async def my_attendance(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """Get the current employee's attendance records."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    query = select(AttendanceRecord).where(
        AttendanceRecord.employee_id == current_user.employee_id
    )
    return await paginate(db, query, params, AttendanceRecordResponse)


@router.get("/summary", response_model=AttendanceSummary)
async def attendance_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(...),
    employee_id: UUID | None = Query(default=None),
):
    """Get monthly attendance summary."""
    emp_id = employee_id or current_user.employee_id
    if not emp_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No employee specified")
    return await get_attendance_summary(db, emp_id, month, year)


@router.post("/regularize", response_model=RegularizationResponse)
async def regularize_attendance(
    data: RegularizationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit an attendance regularization request."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    reg = await create_regularization(
        db, current_user.employee_id, _PLACEHOLDER_TENANT,
        data.date, data.requested_status, data.reason,
        data.requested_check_in, data.requested_check_out,
    )
    return RegularizationResponse.model_validate(reg)


@router.patch("/regularize/{regularization_id}", response_model=RegularizationResponse)
async def action_regularization(
    regularization_id: UUID,
    data: RegularizationActionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Approve or reject a regularization request."""
    from datetime import UTC, datetime

    result = await db.execute(
        select(AttendanceRegularization).where(AttendanceRegularization.id == regularization_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regularization not found")

    reg.status = data.status
    reg.approved_by = current_user.id
    reg.approved_at = datetime.now(UTC)

    # If approved, update the attendance record
    if data.status == "approved":
        rec_result = await db.execute(
            select(AttendanceRecord).where(
                and_(
                    AttendanceRecord.employee_id == reg.employee_id,
                    AttendanceRecord.date == reg.date,
                )
            )
        )
        record = rec_result.scalar_one_or_none()
        if record:
            record.status = reg.requested_status
            record.is_regularized = True
            if reg.requested_check_in:
                record.check_in_time = reg.requested_check_in
            if reg.requested_check_out:
                record.check_out_time = reg.requested_check_out

    await db.flush()
    await db.refresh(reg)
    return RegularizationResponse.model_validate(reg)
