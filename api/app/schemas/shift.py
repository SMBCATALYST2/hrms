"""Request/response schemas for the Shift module."""

import uuid
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ShiftTypeCreate(BaseModel):
    """Payload for creating a shift type."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=100)
    start_time: time
    end_time: time
    grace_period_minutes: int = 15
    half_day_hours: Decimal = Decimal("4.00")
    full_day_hours: Decimal = Decimal("8.00")
    is_night_shift: bool = False
    break_duration_minutes: int | None = 60


class ShiftTypeUpdate(BaseModel):
    """Partial update payload for a shift type."""

    name: str | None = None
    start_time: time | None = None
    end_time: time | None = None
    grace_period_minutes: int | None = None
    half_day_hours: Decimal | None = None
    full_day_hours: Decimal | None = None
    is_night_shift: bool | None = None
    break_duration_minutes: int | None = None
    is_active: bool | None = None


class ShiftTypeResponse(BaseModel):
    """Full shift type record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    start_time: time
    end_time: time
    grace_period_minutes: int
    half_day_hours: Decimal
    full_day_hours: Decimal
    is_night_shift: bool
    break_duration_minutes: int | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ShiftAssignmentCreate(BaseModel):
    """Payload for assigning an employee to a shift."""

    employee_id: uuid.UUID
    shift_id: uuid.UUID
    effective_from: date
    effective_to: date | None = None


class ShiftAssignmentResponse(BaseModel):
    """Full shift assignment record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    shift_id: uuid.UUID
    effective_from: date
    effective_to: date | None = None
    created_at: datetime
