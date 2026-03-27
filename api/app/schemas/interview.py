"""Request/response schemas for the Interview module."""

import uuid
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InterviewScheduleRequest(BaseModel):
    """Payload for scheduling an interview."""

    job_application_id: uuid.UUID
    interview_round_id: uuid.UUID | None = None
    scheduled_date: date
    start_time: time
    end_time: time
    location: str | None = None
    meeting_link: str | None = None
    interviewer_ids: list[uuid.UUID] = []


class InterviewUpdateRequest(BaseModel):
    """Partial update for an interview."""

    scheduled_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    location: str | None = None
    meeting_link: str | None = None
    interviewer_ids: list[uuid.UUID] | None = None
    status: str | None = None
    outcome: str | None = None
    notes: str | None = None


class InterviewResponse(BaseModel):
    """Full interview record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_application_id: uuid.UUID
    interview_round_id: uuid.UUID | None = None
    scheduled_date: date
    start_time: time
    end_time: time
    location: str | None = None
    meeting_link: str | None = None
    interviewer_ids: list | None = None
    status: str
    overall_rating: Decimal | None = None
    outcome: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class InterviewFeedbackCreate(BaseModel):
    """Payload for submitting interview feedback."""

    interview_id: uuid.UUID
    interviewer_id: uuid.UUID
    rating: Decimal | None = Field(default=None, ge=1, le=5)
    strengths: str | None = None
    weaknesses: str | None = None
    comments: str | None = None
    recommendation: str | None = Field(
        default=None,
        pattern="^(strong_hire|hire|no_hire|strong_no_hire)$",
    )
    skill_ratings: dict | None = None


class InterviewFeedbackResponse(BaseModel):
    """Full interview feedback record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    interview_id: uuid.UUID
    interviewer_id: uuid.UUID
    rating: Decimal | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    comments: str | None = None
    recommendation: str | None = None
    skill_ratings: dict | None = None
    created_at: datetime
    updated_at: datetime
