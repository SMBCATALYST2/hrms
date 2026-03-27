"""Request/response schemas for the Assessment module."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- Question Bank ---

class QuestionInput(BaseModel):
    """Question input for creation."""

    text: str
    type: str = "mcq"
    options: list | None = None
    correct_answer: str | None = None
    points: Decimal = Decimal("1")
    difficulty: str = "medium"
    explanation: str | None = None
    sort_order: int = 0


class QuestionBankCreate(BaseModel):
    """Payload for creating a question bank."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    category: str | None = None
    questions: list[QuestionInput] = []


class QuestionResponse(BaseModel):
    """Full question record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_bank_id: uuid.UUID
    text: str
    type: str
    options: list | None = None
    correct_answer: str | None = None
    points: Decimal
    difficulty: str
    explanation: str | None = None
    sort_order: int
    created_at: datetime
    updated_at: datetime


class QuestionBankResponse(BaseModel):
    """Full question bank record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    category: str | None = None
    is_active: bool
    questions: list[QuestionResponse] = []
    created_at: datetime
    updated_at: datetime


# --- Assessment ---

class AssessmentCreate(BaseModel):
    """Payload for creating an assessment."""

    company_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    assessment_type: str = "skill"
    question_bank_id: uuid.UUID | None = None
    question_ids: list[uuid.UUID] | None = None
    total_points: Decimal = Decimal("0")
    passing_percentage: Decimal = Decimal("60")
    time_limit_minutes: int | None = None
    max_attempts: int = 1


class AssessmentUpdate(BaseModel):
    """Partial update for an assessment."""

    title: str | None = None
    description: str | None = None
    question_ids: list[uuid.UUID] | None = None
    total_points: Decimal | None = None
    passing_percentage: Decimal | None = None
    time_limit_minutes: int | None = None
    max_attempts: int | None = None
    is_active: bool | None = None


class AssessmentResponse(BaseModel):
    """Full assessment record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    description: str | None = None
    assessment_type: str
    question_bank_id: uuid.UUID | None = None
    question_ids: list | None = None
    total_points: Decimal
    passing_percentage: Decimal
    time_limit_minutes: int | None = None
    max_attempts: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# --- Submission ---

class AnswerInput(BaseModel):
    """Individual answer input."""

    question_id: uuid.UUID
    answer: str | None = None


class AssessmentSubmissionCreate(BaseModel):
    """Payload for starting an assessment submission."""

    assessment_id: uuid.UUID


class AssessmentSubmitAnswers(BaseModel):
    """Payload for submitting answers."""

    answers: list[AnswerInput]


class AssessmentAnswerResponse(BaseModel):
    """Assessment answer response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_id: uuid.UUID
    answer: str | None = None
    is_correct: bool | None = None
    points_awarded: Decimal


class AssessmentSubmissionResponse(BaseModel):
    """Full assessment submission record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assessment_id: uuid.UUID
    employee_id: uuid.UUID
    attempt_number: int
    started_at: datetime
    completed_at: datetime | None = None
    score: Decimal | None = None
    percentage: Decimal | None = None
    passed: bool | None = None
    status: str
    answers: list[AssessmentAnswerResponse] = []
    created_at: datetime
    updated_at: datetime
