"""Recruitment service: pipeline management and interview scheduling."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview import Interview, InterviewFeedback
from app.models.recruitment import JobApplication, JobOpening


async def update_application_stage(
    db: AsyncSession, application_id: UUID, stage: str, notes: str | None = None,
) -> JobApplication:
    """Move a job application to a new pipeline stage."""
    result = await db.execute(
        select(JobApplication).where(JobApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job application not found")

    # Stage transition validation
    valid_transitions = {
        "applied": ["screening", "rejected"],
        "screening": ["shortlisted", "rejected"],
        "shortlisted": ["interview", "rejected", "on_hold"],
        "interview": ["selected", "rejected", "on_hold"],
        "on_hold": ["screening", "shortlisted", "interview", "rejected"],
        "selected": [],
        "rejected": [],
    }

    allowed = valid_transitions.get(application.stage, [])
    if stage not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{application.stage}' to '{stage}'",
        )

    application.stage = stage
    if notes:
        application.notes = notes

    # If selected, increment filled count on the job opening
    if stage == "selected":
        opening_result = await db.execute(
            select(JobOpening).where(JobOpening.id == application.job_opening_id)
        )
        opening = opening_result.scalar_one_or_none()
        if opening:
            opening.filled += 1
            if opening.filled >= opening.vacancies:
                opening.status = "closed"

    await db.flush()
    await db.refresh(application)
    return application


async def schedule_interview(
    db: AsyncSession,
    job_application_id: UUID,
    interview_round_id: UUID | None,
    scheduled_date,
    start_time,
    end_time,
    location: str | None = None,
    meeting_link: str | None = None,
    interviewer_ids: list | None = None,
) -> Interview:
    """Schedule an interview for a job application."""
    # Verify application exists
    result = await db.execute(
        select(JobApplication).where(JobApplication.id == job_application_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job application not found")

    interview = Interview(
        job_application_id=job_application_id,
        interview_round_id=interview_round_id,
        scheduled_date=scheduled_date,
        start_time=start_time,
        end_time=end_time,
        location=location,
        meeting_link=meeting_link,
        interviewer_ids=interviewer_ids,
    )
    db.add(interview)
    await db.flush()
    await db.refresh(interview)
    return interview


async def submit_feedback(
    db: AsyncSession,
    interview_id: UUID,
    interviewer_id: UUID,
    rating=None,
    strengths: str | None = None,
    weaknesses: str | None = None,
    comments: str | None = None,
    recommendation: str | None = None,
    skill_ratings: dict | None = None,
) -> InterviewFeedback:
    """Submit interviewer feedback for an interview."""
    # Verify interview exists
    result = await db.execute(select(Interview).where(Interview.id == interview_id))
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    feedback = InterviewFeedback(
        interview_id=interview_id,
        interviewer_id=interviewer_id,
        rating=rating,
        strengths=strengths,
        weaknesses=weaknesses,
        comments=comments,
        recommendation=recommendation,
        skill_ratings=skill_ratings,
    )
    db.add(feedback)
    await db.flush()
    await db.refresh(feedback)
    return feedback
