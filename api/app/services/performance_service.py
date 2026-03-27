"""Performance service: review cycle management, ratings, 360 feedback."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.performance import Feedback360, PerformanceReview, ReviewCycle, ReviewRating


async def create_reviews_for_cycle(db: AsyncSession, cycle_id: UUID) -> int:
    """Create performance review records for all active employees in the cycle's company."""
    result = await db.execute(select(ReviewCycle).where(ReviewCycle.id == cycle_id))
    cycle = result.scalar_one_or_none()
    if not cycle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review cycle not found")

    # Get active employees
    emp_result = await db.execute(
        select(Employee).where(
            and_(
                Employee.company_id == cycle.company_id,
                Employee.status == "active",
            )
        )
    )
    employees = emp_result.scalars().all()

    count = 0
    for emp in employees:
        # Skip if already has a review in this cycle
        existing = await db.execute(
            select(PerformanceReview).where(
                and_(
                    PerformanceReview.cycle_id == cycle_id,
                    PerformanceReview.employee_id == emp.id,
                )
            )
        )
        if existing.scalar_one_or_none():
            continue

        reviewer_id = emp.reporting_manager_id or emp.id
        review = PerformanceReview(
            cycle_id=cycle_id,
            employee_id=emp.id,
            reviewer_id=reviewer_id,
        )
        db.add(review)
        count += 1

    await db.flush()
    return count


async def submit_self_assessment(
    db: AsyncSession,
    review_id: UUID,
    self_assessment: str,
    self_rating: Decimal | None = None,
    goals_achieved: str | None = None,
) -> PerformanceReview:
    """Submit the self-assessment portion of a performance review."""
    result = await db.execute(
        select(PerformanceReview).where(PerformanceReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.self_assessment = self_assessment
    review.self_rating = self_rating
    review.goals_achieved = goals_achieved
    review.status = "manager_review"

    await db.flush()
    await db.refresh(review)
    return review


async def submit_manager_review(
    db: AsyncSession,
    review_id: UUID,
    manager_assessment: str,
    manager_rating: Decimal | None = None,
    areas_of_improvement: str | None = None,
    training_recommendations: str | None = None,
    final_rating: Decimal | None = None,
    final_comment: str | None = None,
) -> PerformanceReview:
    """Submit the manager review portion of a performance review."""
    result = await db.execute(
        select(PerformanceReview).where(PerformanceReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.manager_assessment = manager_assessment
    review.manager_rating = manager_rating
    review.areas_of_improvement = areas_of_improvement
    review.training_recommendations = training_recommendations
    review.final_rating = final_rating
    review.final_comment = final_comment
    review.status = "completed"

    await db.flush()
    await db.refresh(review)
    return review


async def submit_360_feedback(
    db: AsyncSession,
    review_id: UUID,
    reviewer_employee_id: UUID,
    relationship_type: str,
    rating: Decimal | None = None,
    feedback: str | None = None,
    strengths: str | None = None,
    areas_of_improvement: str | None = None,
    is_anonymous: bool = True,
) -> Feedback360:
    """Submit 360-degree feedback for a performance review."""
    # Verify review exists
    result = await db.execute(
        select(PerformanceReview).where(PerformanceReview.id == review_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    fb = Feedback360(
        review_id=review_id,
        reviewer_employee_id=reviewer_employee_id,
        relationship_type=relationship_type,
        rating=rating,
        feedback=feedback,
        strengths=strengths,
        areas_of_improvement=areas_of_improvement,
        is_anonymous=is_anonymous,
        status="submitted",
    )
    db.add(fb)
    await db.flush()
    await db.refresh(fb)
    return fb
