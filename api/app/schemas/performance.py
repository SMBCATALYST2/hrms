"""Request/response schemas for the Performance module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- Review Cycle ---

class ReviewCycleCreate(BaseModel):
    """Payload for creating a review cycle."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    review_type: str = "annual"
    start_date: date
    end_date: date
    self_review_deadline: date | None = None
    manager_review_deadline: date | None = None
    competency_framework_id: uuid.UUID | None = None
    is_360_enabled: bool = False


class ReviewCycleUpdate(BaseModel):
    """Partial update for a review cycle."""

    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    self_review_deadline: date | None = None
    manager_review_deadline: date | None = None
    status: str | None = None
    is_360_enabled: bool | None = None


class ReviewCycleResponse(BaseModel):
    """Full review cycle record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    review_type: str
    start_date: date
    end_date: date
    self_review_deadline: date | None = None
    manager_review_deadline: date | None = None
    competency_framework_id: uuid.UUID | None = None
    status: str
    is_360_enabled: bool
    created_at: datetime
    updated_at: datetime


# --- Performance Review ---

class SelfAssessmentRequest(BaseModel):
    """Payload for employee self-assessment."""

    self_assessment: str
    self_rating: Decimal | None = Field(default=None, ge=1, le=5)
    goals_achieved: str | None = None


class ManagerReviewRequest(BaseModel):
    """Payload for manager review."""

    manager_assessment: str
    manager_rating: Decimal | None = Field(default=None, ge=1, le=5)
    areas_of_improvement: str | None = None
    training_recommendations: str | None = None
    final_rating: Decimal | None = Field(default=None, ge=1, le=5)
    final_comment: str | None = None


class ReviewRatingInput(BaseModel):
    """Competency rating input."""

    competency_id: uuid.UUID
    self_rating: Decimal | None = Field(default=None, ge=1, le=5)
    manager_rating: Decimal | None = Field(default=None, ge=1, le=5)
    comments: str | None = None


class PerformanceReviewResponse(BaseModel):
    """Full performance review record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cycle_id: uuid.UUID
    employee_id: uuid.UUID
    reviewer_id: uuid.UUID
    self_assessment: str | None = None
    self_rating: Decimal | None = None
    manager_assessment: str | None = None
    manager_rating: Decimal | None = None
    final_rating: Decimal | None = None
    final_comment: str | None = None
    goals_achieved: str | None = None
    areas_of_improvement: str | None = None
    training_recommendations: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


# --- 360 Feedback ---

class Feedback360Create(BaseModel):
    """Payload for 360-degree feedback submission."""

    review_id: uuid.UUID
    relationship_type: str = Field(
        ..., pattern="^(peer|subordinate|cross_functional)$"
    )
    rating: Decimal | None = Field(default=None, ge=1, le=5)
    feedback: str | None = None
    strengths: str | None = None
    areas_of_improvement: str | None = None
    is_anonymous: bool = True


class Feedback360Response(BaseModel):
    """Full 360 feedback record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    review_id: uuid.UUID
    reviewer_employee_id: uuid.UUID
    relationship_type: str
    rating: Decimal | None = None
    feedback: str | None = None
    strengths: str | None = None
    areas_of_improvement: str | None = None
    is_anonymous: bool
    status: str
    created_at: datetime
    updated_at: datetime
