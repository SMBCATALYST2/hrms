"""Interview module models: rounds, interviews, and feedback."""

import uuid
from datetime import date, datetime, time
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class InterviewRound(Base, TimestampMixin):
    """Template for interview rounds used in a hiring pipeline."""

    __tablename__ = "interview_round"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    round_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="technical"
    )  # screening, technical, hr, managerial, culture_fit
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Interview(Base, TimestampMixin):
    """Scheduled interview for a job application."""

    __tablename__ = "interview"

    job_application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_application.id"), nullable=False, index=True
    )
    interview_round_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interview_round.id"), nullable=True
    )
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    meeting_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interviewer_ids: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="scheduled"
    )  # scheduled, in_progress, completed, cancelled, rescheduled
    overall_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    outcome: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # pass, fail, on_hold
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    feedbacks: Mapped[list["InterviewFeedback"]] = relationship(back_populates="interview")


class InterviewFeedback(Base, TimestampMixin):
    """Individual interviewer feedback for an interview."""

    __tablename__ = "interview_feedback"

    interview_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("interview.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    interviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)  # 1.0-5.0
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # strong_hire, hire, no_hire, strong_no_hire
    skill_ratings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Relationships
    interview: Mapped["Interview"] = relationship(back_populates="feedbacks")
