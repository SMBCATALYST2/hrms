"""Assessment module models: assessments, question banks, submissions."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class QuestionBank(Base, TimestampMixin):
    """Collection of questions grouped by topic / category."""

    __tablename__ = "question_bank"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    questions: Mapped[list["Question"]] = relationship(
        back_populates="question_bank", cascade="all, delete-orphan"
    )


class Question(Base, TimestampMixin):
    """Individual question in a question bank."""

    __tablename__ = "question"

    question_bank_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("question_bank.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="mcq"
    )  # mcq, multi_select, text, rating, true_false
    options: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    correct_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=1)
    difficulty: Mapped[str] = mapped_column(
        String(10), nullable=False, default="medium"
    )  # easy, medium, hard
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    question_bank: Mapped["QuestionBank"] = relationship(back_populates="questions")


class Assessment(Base, TimestampMixin):
    """Assessment / quiz / test that can be assigned to employees or candidates."""

    __tablename__ = "assessment"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assessment_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="skill"
    )  # skill, onboarding, compliance, recruitment
    question_bank_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("question_bank.id"), nullable=True
    )
    question_ids: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    total_points: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=0)
    passing_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=60)
    time_limit_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    submissions: Mapped[list["AssessmentSubmission"]] = relationship(back_populates="assessment")


class AssessmentSubmission(Base, TimestampMixin):
    """Employee's submission / attempt of an assessment."""

    __tablename__ = "assessment_submission"

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    started_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    score: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    passed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="in_progress"
    )  # in_progress, completed, timed_out

    # Relationships
    assessment: Mapped["Assessment"] = relationship(back_populates="submissions")
    answers: Mapped[list["AssessmentAnswer"]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )


class AssessmentAnswer(Base):
    """Individual answer in an assessment submission."""

    __tablename__ = "assessment_answer"

    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("assessment_submission.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("question.id"), nullable=False
    )
    answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    points_awarded: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False, default=0)

    # Relationships
    submission: Mapped["AssessmentSubmission"] = relationship(back_populates="answers")
