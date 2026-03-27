"""Request/response schemas for the OKR module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- OKR Cycle ---

class OKRCycleCreate(BaseModel):
    """Payload for creating an OKR cycle."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    start_date: date
    end_date: date


class OKRCycleUpdate(BaseModel):
    """Partial update for an OKR cycle."""

    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None


class OKRCycleResponse(BaseModel):
    """Full OKR cycle record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    status: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


# --- Objective ---

class ObjectiveCreate(BaseModel):
    """Payload for creating an objective."""

    cycle_id: uuid.UUID
    owner_employee_id: uuid.UUID
    parent_objective_id: uuid.UUID | None = None
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    scope: str = "individual"
    department_id: uuid.UUID | None = None
    weight: Decimal = Decimal("1")


class ObjectiveUpdate(BaseModel):
    """Partial update for an objective."""

    title: str | None = None
    description: str | None = None
    scope: str | None = None
    status: str | None = None
    weight: Decimal | None = None


class ObjectiveResponse(BaseModel):
    """Full objective record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cycle_id: uuid.UUID
    owner_employee_id: uuid.UUID
    parent_objective_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    scope: str
    department_id: uuid.UUID | None = None
    progress: Decimal
    status: str
    weight: Decimal
    created_at: datetime
    updated_at: datetime


# --- Key Result ---

class KeyResultCreate(BaseModel):
    """Payload for creating a key result."""

    objective_id: uuid.UUID
    owner_employee_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    metric_type: str = "number"
    start_value: Decimal = Decimal("0")
    target_value: Decimal
    unit: str | None = None
    weight: Decimal = Decimal("1")


class KeyResultUpdate(BaseModel):
    """Partial update for a key result."""

    title: str | None = None
    description: str | None = None
    target_value: Decimal | None = None
    status: str | None = None
    weight: Decimal | None = None


class KeyResultResponse(BaseModel):
    """Full key result record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    objective_id: uuid.UUID
    owner_employee_id: uuid.UUID
    title: str
    description: str | None = None
    metric_type: str
    start_value: Decimal
    target_value: Decimal
    current_value: Decimal
    unit: str | None = None
    progress: Decimal
    weight: Decimal
    status: str
    created_at: datetime
    updated_at: datetime


# --- Check-In ---

class OKRCheckInCreate(BaseModel):
    """Payload for a key result check-in."""

    key_result_id: uuid.UUID
    new_value: Decimal
    comment: str | None = None
    confidence_level: str | None = Field(
        default=None, pattern="^(high|medium|low)$"
    )


class OKRCheckInResponse(BaseModel):
    """Full check-in record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    key_result_id: uuid.UUID
    employee_id: uuid.UUID
    previous_value: Decimal
    new_value: Decimal
    comment: str | None = None
    confidence_level: str | None = None
    created_at: datetime
    updated_at: datetime
