"""Performance module models: review cycles, reviews, competencies, 360 feedback, PIPs."""

import uuid
from datetime import date, datetime
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
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class CompetencyFramework(Base, TimestampMixin):
    """Company-level competency framework grouping competencies."""

    __tablename__ = "competency_framework"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    competencies: Mapped[list["Competency"]] = relationship(
        back_populates="framework", cascade="all, delete-orphan"
    )


class Competency(Base):
    """Individual competency within a framework."""

    __tablename__ = "competency"

    framework_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("competency_framework.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # technical, behavioral, leadership
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    framework: Mapped["CompetencyFramework"] = relationship(back_populates="competencies")


class ReviewCycle(Base, TimestampMixin):
    """Performance review cycle for a company."""

    __tablename__ = "review_cycle"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    review_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="annual"
    )  # annual, mid_year, quarterly, probation
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    self_review_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    manager_review_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    competency_framework_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("competency_framework.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, active, closed
    is_360_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    reviews: Mapped[list["PerformanceReview"]] = relationship(back_populates="cycle")


class PerformanceReview(Base, TimestampMixin):
    """Individual performance review for an employee in a cycle."""

    __tablename__ = "performance_review"

    cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("review_cycle.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    self_assessment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    self_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    manager_assessment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    manager_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    final_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    final_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    goals_achieved: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    areas_of_improvement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    training_recommendations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # pending, self_review, manager_review, calibration, completed

    # Relationships
    cycle: Mapped["ReviewCycle"] = relationship(back_populates="reviews")
    ratings: Mapped[list["ReviewRating"]] = relationship(
        back_populates="review", cascade="all, delete-orphan"
    )


class ReviewRating(Base):
    """Competency-level rating within a performance review."""

    __tablename__ = "review_rating"

    review_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("performance_review.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    competency_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("competency.id"), nullable=False
    )
    self_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    manager_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    final_rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    review: Mapped["PerformanceReview"] = relationship(back_populates="ratings")


class Feedback360(Base, TimestampMixin):
    """360-degree feedback request and response."""

    __tablename__ = "feedback_360"

    review_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("performance_review.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    reviewer_employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # peer, subordinate, cross_functional
    rating: Mapped[Optional[Decimal]] = mapped_column(Numeric(3, 1), nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    areas_of_improvement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # pending, submitted


class PIP(Base, TimestampMixin):
    """Performance Improvement Plan for underperforming employees."""

    __tablename__ = "pip"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    review_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("performance_review.id"), nullable=True
    )
    manager_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    objectives: Mapped[str] = mapped_column(Text, nullable=False)
    milestones: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active"
    )  # active, completed_success, completed_fail, extended, cancelled
    outcome_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
