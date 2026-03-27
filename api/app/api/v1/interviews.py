"""Interview routes: schedule, feedback, list."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, get_current_user
from app.models.interview import Interview, InterviewFeedback
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.interview import (
    InterviewFeedbackCreate,
    InterviewFeedbackResponse,
    InterviewResponse,
    InterviewScheduleRequest,
    InterviewUpdateRequest,
)
from app.services.recruitment_service import schedule_interview, submit_feedback
from app.utils.pagination import paginate

router = APIRouter()


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview_route(
    data: InterviewScheduleRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Schedule a new interview."""
    interview = await schedule_interview(
        db, data.job_application_id, data.interview_round_id,
        data.scheduled_date, data.start_time, data.end_time,
        data.location, data.meeting_link, data.interviewer_ids,
    )
    return InterviewResponse.model_validate(interview)


@router.get("", response_model=PaginatedResponse[InterviewResponse])
async def list_interviews(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    application_id: UUID | None = Query(default=None),
):
    """List interviews."""
    query = select(Interview)
    if application_id:
        query = query.where(Interview.job_application_id == application_id)
    return await paginate(db, query, params, InterviewResponse)


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single interview."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return InterviewResponse.model_validate(interview)


@router.patch("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: UUID,
    data: InterviewUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an interview."""
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)
    await db.flush()
    await db.refresh(interview)
    return InterviewResponse.model_validate(interview)


@router.post("/feedback", response_model=InterviewFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    data: InterviewFeedbackCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit interview feedback."""
    feedback = await submit_feedback(
        db, data.interview_id, data.interviewer_id,
        data.rating, data.strengths, data.weaknesses,
        data.comments, data.recommendation, data.skill_ratings,
    )
    return InterviewFeedbackResponse.model_validate(feedback)


@router.get("/{interview_id}/feedback", response_model=list[InterviewFeedbackResponse])
async def list_feedback(
    interview_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all feedback for an interview."""
    result = await db.execute(
        select(InterviewFeedback).where(InterviewFeedback.interview_id == interview_id)
    )
    feedbacks = result.scalars().all()
    return [InterviewFeedbackResponse.model_validate(f) for f in feedbacks]
