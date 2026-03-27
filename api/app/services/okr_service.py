"""OKR service: progress calculation, alignment, check-ins."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.okr import KeyResult, Objective, OKRCheckIn


async def calculate_key_result_progress(kr: KeyResult) -> Decimal:
    """Calculate progress percentage for a key result."""
    if kr.target_value == kr.start_value:
        return Decimal("100") if kr.current_value >= kr.target_value else Decimal("0")

    range_val = kr.target_value - kr.start_value
    if range_val == 0:
        return Decimal("0")

    progress = ((kr.current_value - kr.start_value) / range_val) * 100
    return min(max(progress, Decimal("0")), Decimal("100")).quantize(Decimal("0.01"))


async def update_objective_progress(db: AsyncSession, objective_id: UUID) -> Objective:
    """Recalculate objective progress from its key results."""
    result = await db.execute(select(Objective).where(Objective.id == objective_id))
    objective = result.scalar_one_or_none()
    if not objective:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")

    kr_result = await db.execute(
        select(KeyResult).where(KeyResult.objective_id == objective_id)
    )
    key_results = kr_result.scalars().all()

    if not key_results:
        objective.progress = Decimal("0")
    else:
        total_weight = sum(kr.weight for kr in key_results)
        if total_weight > 0:
            weighted_sum = Decimal("0")
            for kr in key_results:
                kr_progress = await calculate_key_result_progress(kr)
                weighted_sum += kr_progress * kr.weight
            objective.progress = (weighted_sum / total_weight).quantize(Decimal("0.01"))
        else:
            objective.progress = Decimal("0")

    # Update status based on progress
    if objective.progress >= 100:
        objective.status = "completed"
    elif objective.progress > 0:
        if objective.progress >= 70:
            objective.status = "on_track"
        elif objective.progress >= 40:
            objective.status = "behind"
        else:
            objective.status = "at_risk"

    await db.flush()
    await db.refresh(objective)
    return objective


async def create_check_in(
    db: AsyncSession,
    key_result_id: UUID,
    employee_id: UUID,
    new_value: Decimal,
    comment: str | None = None,
    confidence_level: str | None = None,
) -> OKRCheckIn:
    """Record a progress check-in on a key result."""
    kr_result = await db.execute(select(KeyResult).where(KeyResult.id == key_result_id))
    kr = kr_result.scalar_one_or_none()
    if not kr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Key result not found")

    check_in = OKRCheckIn(
        key_result_id=key_result_id,
        employee_id=employee_id,
        previous_value=kr.current_value,
        new_value=new_value,
        comment=comment,
        confidence_level=confidence_level,
    )
    db.add(check_in)

    # Update key result current value and progress
    kr.current_value = new_value
    kr.progress = await calculate_key_result_progress(kr)

    await db.flush()

    # Cascade to objective
    await update_objective_progress(db, kr.objective_id)

    await db.refresh(check_in)
    return check_in
