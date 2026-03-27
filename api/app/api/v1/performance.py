"""Performance routes: review cycles, reviews, self-assessment, 360 feedback, ratings."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.performance import Feedback360, PerformanceReview, ReviewCycle, ReviewRating
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.performance import (
    Feedback360Create,
    Feedback360Response,
    ManagerReviewRequest,
    PerformanceReviewResponse,
    ReviewCycleCreate,
    ReviewCycleResponse,
    ReviewCycleUpdate,
    ReviewRatingInput,
    SelfAssessmentRequest,
)
from app.services.performance_service import (
    create_reviews_for_cycle,
    submit_360_feedback,
    submit_manager_review,
    submit_self_assessment,
)
from app.utils.pagination import paginate

router = APIRouter()


# --- Review Cycles ---

@router.get("/cycles", response_model=PaginatedResponse[ReviewCycleResponse])
async def list_review_cycles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List review cycles."""
    query = select(ReviewCycle)
    if company_id:
        query = query.where(ReviewCycle.company_id == company_id)
    return await paginate(db, query, params, ReviewCycleResponse)


@router.post("/cycles", response_model=ReviewCycleResponse, status_code=status.HTTP_201_CREATED)
async def create_review_cycle(
    data: ReviewCycleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a review cycle."""
    cycle = ReviewCycle(**data.model_dump())
    db.add(cycle)
    await db.flush()
    await db.refresh(cycle)
    return ReviewCycleResponse.model_validate(cycle)


@router.patch("/cycles/{cycle_id}", response_model=ReviewCycleResponse)
async def update_review_cycle(
    cycle_id: UUID,
    data: ReviewCycleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a review cycle."""
    result = await db.execute(select(ReviewCycle).where(ReviewCycle.id == cycle_id))
    cycle = result.scalar_one_or_none()
    if not cycle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review cycle not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cycle, field, value)
    await db.flush()
    await db.refresh(cycle)
    return ReviewCycleResponse.model_validate(cycle)


@router.post("/cycles/{cycle_id}/generate-reviews", response_model=SuccessResponse)
async def generate_reviews(
    cycle_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Generate review records for all active employees in the cycle's company."""
    count = await create_reviews_for_cycle(db, cycle_id)
    return SuccessResponse(message=f"Created {count} performance reviews")


# --- Reviews ---

@router.get("/reviews", response_model=PaginatedResponse[PerformanceReviewResponse])
async def list_reviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    cycle_id: UUID | None = Query(default=None),
    employee_id: UUID | None = Query(default=None),
):
    """List performance reviews."""
    query = select(PerformanceReview)
    if cycle_id:
        query = query.where(PerformanceReview.cycle_id == cycle_id)
    if employee_id:
        query = query.where(PerformanceReview.employee_id == employee_id)
    elif current_user.employee_id:
        query = query.where(PerformanceReview.employee_id == current_user.employee_id)
    return await paginate(db, query, params, PerformanceReviewResponse)


@router.get("/reviews/{review_id}", response_model=PerformanceReviewResponse)
async def get_review(
    review_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single performance review."""
    result = await db.execute(
        select(PerformanceReview).where(PerformanceReview.id == review_id)
    )
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return PerformanceReviewResponse.model_validate(review)


@router.patch("/reviews/{review_id}/self-assessment", response_model=PerformanceReviewResponse)
async def self_assessment(
    review_id: UUID,
    data: SelfAssessmentRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit self-assessment for a performance review."""
    review = await submit_self_assessment(
        db, review_id, data.self_assessment, data.self_rating, data.goals_achieved,
    )
    return PerformanceReviewResponse.model_validate(review)


@router.patch("/reviews/{review_id}/manager-review", response_model=PerformanceReviewResponse)
async def manager_review(
    review_id: UUID,
    data: ManagerReviewRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Submit manager review for a performance review."""
    review = await submit_manager_review(
        db, review_id, data.manager_assessment, data.manager_rating,
        data.areas_of_improvement, data.training_recommendations,
        data.final_rating, data.final_comment,
    )
    return PerformanceReviewResponse.model_validate(review)


@router.post("/reviews/{review_id}/ratings", response_model=SuccessResponse)
async def submit_ratings(
    review_id: UUID,
    ratings: list[ReviewRatingInput],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit competency ratings for a performance review."""
    for rating_data in ratings:
        rating = ReviewRating(
            review_id=review_id,
            competency_id=rating_data.competency_id,
            self_rating=rating_data.self_rating,
            manager_rating=rating_data.manager_rating,
            comments=rating_data.comments,
        )
        db.add(rating)
    await db.flush()
    return SuccessResponse(message="Ratings submitted")


# --- 360 Feedback ---

@router.post("/360-feedback", response_model=Feedback360Response, status_code=status.HTTP_201_CREATED)
async def create_360_feedback(
    data: Feedback360Create,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit 360-degree feedback."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    fb = await submit_360_feedback(
        db, data.review_id, current_user.employee_id,
        data.relationship_type, data.rating, data.feedback,
        data.strengths, data.areas_of_improvement, data.is_anonymous,
    )
    return Feedback360Response.model_validate(fb)


@router.get("/360-feedback", response_model=PaginatedResponse[Feedback360Response])
async def list_360_feedback(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    review_id: UUID | None = Query(default=None),
):
    """List 360-degree feedback."""
    query = select(Feedback360)
    if review_id:
        query = query.where(Feedback360.review_id == review_id)
    return await paginate(db, query, params, Feedback360Response)
