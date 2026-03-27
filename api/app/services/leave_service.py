"""Leave service: balance calculation, application workflow, accrual."""

from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.leave import LeaveApplication, LeaveBalance, LeaveType


async def get_leave_balance(
    db: AsyncSession, employee_id: UUID, leave_type_id: UUID, year: int,
) -> LeaveBalance | None:
    """Fetch leave balance for a specific employee, type, and year."""
    result = await db.execute(
        select(LeaveBalance).where(
            and_(
                LeaveBalance.employee_id == employee_id,
                LeaveBalance.leave_type_id == leave_type_id,
                LeaveBalance.year == year,
            )
        )
    )
    return result.scalar_one_or_none()


async def get_all_balances(
    db: AsyncSession, employee_id: UUID, year: int,
) -> list[LeaveBalance]:
    """Get all leave balances for an employee in a year."""
    result = await db.execute(
        select(LeaveBalance).where(
            and_(
                LeaveBalance.employee_id == employee_id,
                LeaveBalance.year == year,
            )
        )
    )
    return list(result.scalars().all())


async def allocate_leave(
    db: AsyncSession,
    tenant_id: UUID,
    employee_id: UUID,
    leave_type_id: UUID,
    year: int,
    allocated: Decimal,
) -> LeaveBalance:
    """Allocate leave balance for an employee."""
    balance = await get_leave_balance(db, employee_id, leave_type_id, year)
    if balance:
        balance.allocated = allocated
    else:
        balance = LeaveBalance(
            tenant_id=tenant_id,
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            year=year,
            allocated=allocated,
        )
        db.add(balance)
    await db.flush()
    await db.refresh(balance)
    return balance


def _calculate_leave_days(from_date: date, to_date: date, from_half: str, to_half: str) -> Decimal:
    """Calculate total leave days based on date range and half-day selections."""
    if from_date == to_date:
        if from_half in ("first_half", "second_half") or to_half in ("first_half", "second_half"):
            return Decimal("0.5")
        return Decimal("1")

    total = Decimal(str((to_date - from_date).days + 1))

    if from_half in ("first_half", "second_half"):
        total -= Decimal("0.5")
    if to_half in ("first_half", "second_half"):
        total -= Decimal("0.5")

    return total


async def apply_leave(
    db: AsyncSession,
    tenant_id: UUID,
    employee_id: UUID,
    leave_type_id: UUID,
    from_date: date,
    to_date: date,
    from_half: str = "full_day",
    to_half: str = "full_day",
    reason: str | None = None,
) -> LeaveApplication:
    """Submit a leave application."""
    if to_date < from_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="to_date must be >= from_date",
        )

    total_days = _calculate_leave_days(from_date, to_date, from_half, to_half)

    # Check balance
    year = from_date.year
    balance = await get_leave_balance(db, employee_id, leave_type_id, year)
    if balance:
        available = balance.current_balance
        if available < total_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient leave balance. Available: {available}, Requested: {total_days}",
            )

    application = LeaveApplication(
        tenant_id=tenant_id,
        employee_id=employee_id,
        leave_type_id=leave_type_id,
        from_date=from_date,
        to_date=to_date,
        from_half=from_half,
        to_half=to_half,
        total_days=total_days,
        reason=reason,
        status="pending",
    )
    db.add(application)

    # Update pending balance
    if balance:
        balance.pending += total_days

    await db.flush()
    await db.refresh(application)
    return application


async def approve_leave(
    db: AsyncSession, application_id: UUID, approved_by: UUID,
) -> LeaveApplication:
    """Approve a leave application."""
    result = await db.execute(
        select(LeaveApplication).where(LeaveApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave application not found")

    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve application with status '{application.status}'",
        )

    from datetime import datetime, UTC
    application.status = "approved"
    application.approved_by = approved_by
    application.approved_at = datetime.now(UTC)

    # Move from pending to taken
    balance = await get_leave_balance(
        db, application.employee_id, application.leave_type_id, application.from_date.year,
    )
    if balance:
        balance.pending -= application.total_days
        balance.taken += application.total_days

    await db.flush()
    await db.refresh(application)
    return application


async def reject_leave(
    db: AsyncSession, application_id: UUID, approved_by: UUID, rejection_reason: str | None = None,
) -> LeaveApplication:
    """Reject a leave application."""
    result = await db.execute(
        select(LeaveApplication).where(LeaveApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave application not found")

    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject application with status '{application.status}'",
        )

    from datetime import datetime, UTC
    application.status = "rejected"
    application.approved_by = approved_by
    application.approved_at = datetime.now(UTC)
    application.rejection_reason = rejection_reason

    # Release pending balance
    balance = await get_leave_balance(
        db, application.employee_id, application.leave_type_id, application.from_date.year,
    )
    if balance:
        balance.pending -= application.total_days

    await db.flush()
    await db.refresh(application)
    return application
