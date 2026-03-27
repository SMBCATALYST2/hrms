"""Attendance service: check-in/out, summary, working hours calculation."""

from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import AttendancePunch, AttendanceRecord, AttendanceRegularization
from app.schemas.attendance import AttendanceSummary, CheckInRequest, CheckOutRequest


async def check_in(
    db: AsyncSession, employee_id: UUID, tenant_id: UUID, data: CheckInRequest,
) -> AttendanceRecord:
    """Record employee check-in for today."""
    today = date.today()
    now = datetime.now(UTC)

    # Check for existing record
    result = await db.execute(
        select(AttendanceRecord).where(
            and_(AttendanceRecord.employee_id == employee_id, AttendanceRecord.date == today)
        )
    )
    record = result.scalar_one_or_none()

    if record and record.check_in_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today",
        )

    if not record:
        record = AttendanceRecord(
            tenant_id=tenant_id,
            employee_id=employee_id,
            date=today,
            check_in_time=now,
            check_in_source=data.source,
            status="present",
        )
        db.add(record)
    else:
        record.check_in_time = now
        record.check_in_source = data.source
        record.status = "present"

    # Record the punch
    punch = AttendancePunch(
        tenant_id=tenant_id,
        employee_id=employee_id,
        date=today,
        punch_time=now,
        punch_type="in",
        source=data.source,
        geo_lat=data.geo_lat,
        geo_lng=data.geo_lng,
        device_id=data.device_id,
    )
    db.add(punch)
    await db.flush()
    await db.refresh(record)
    return record


async def check_out(
    db: AsyncSession, employee_id: UUID, tenant_id: UUID, data: CheckOutRequest,
) -> AttendanceRecord:
    """Record employee check-out for today."""
    today = date.today()
    now = datetime.now(UTC)

    result = await db.execute(
        select(AttendanceRecord).where(
            and_(AttendanceRecord.employee_id == employee_id, AttendanceRecord.date == today)
        )
    )
    record = result.scalar_one_or_none()

    if not record or not record.check_in_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No check-in found for today",
        )

    if record.check_out_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today",
        )

    record.check_out_time = now
    record.check_out_source = data.source

    # Calculate total hours
    if record.check_in_time:
        diff = now - record.check_in_time
        total_hours = Decimal(str(round(diff.total_seconds() / 3600, 2)))
        record.total_hours = total_hours

    # Record the punch
    punch = AttendancePunch(
        tenant_id=tenant_id,
        employee_id=employee_id,
        date=today,
        punch_time=now,
        punch_type="out",
        source=data.source,
        geo_lat=data.geo_lat,
        geo_lng=data.geo_lng,
    )
    db.add(punch)
    await db.flush()
    await db.refresh(record)
    return record


async def get_attendance_summary(
    db: AsyncSession, employee_id: UUID, month: int, year: int,
) -> AttendanceSummary:
    """Compute monthly attendance summary for an employee."""
    result = await db.execute(
        select(AttendanceRecord).where(
            and_(
                AttendanceRecord.employee_id == employee_id,
                func.extract("month", AttendanceRecord.date) == month,
                func.extract("year", AttendanceRecord.date) == year,
            )
        )
    )
    records = result.scalars().all()

    summary = AttendanceSummary(employee_id=employee_id, month=month, year=year)
    for rec in records:
        if rec.status == "present":
            summary.total_present += 1
        elif rec.status == "absent":
            summary.total_absent += 1
        elif rec.status == "half_day":
            summary.total_half_day += 1
        elif rec.status == "on_leave":
            summary.total_on_leave += 1
        elif rec.status == "holiday":
            summary.total_holidays += 1

        if rec.late_by_minutes > 0:
            summary.total_late += 1
        if rec.early_exit_minutes > 0:
            summary.total_early_exit += 1
        if rec.overtime_hours:
            summary.total_overtime_hours += rec.overtime_hours
        if rec.total_hours:
            summary.total_working_hours += rec.total_hours

    return summary


async def create_regularization(
    db: AsyncSession,
    employee_id: UUID,
    tenant_id: UUID,
    date_val: date,
    requested_status: str,
    reason: str,
    requested_check_in: datetime | None = None,
    requested_check_out: datetime | None = None,
) -> AttendanceRegularization:
    """Create an attendance regularization request."""
    # Get existing record to capture original status
    result = await db.execute(
        select(AttendanceRecord).where(
            and_(AttendanceRecord.employee_id == employee_id, AttendanceRecord.date == date_val)
        )
    )
    existing = result.scalar_one_or_none()
    original_status = existing.status if existing else None

    reg = AttendanceRegularization(
        tenant_id=tenant_id,
        employee_id=employee_id,
        date=date_val,
        original_status=original_status,
        requested_status=requested_status,
        requested_check_in=requested_check_in,
        requested_check_out=requested_check_out,
        reason=reason,
    )
    db.add(reg)
    await db.flush()
    await db.refresh(reg)
    return reg
