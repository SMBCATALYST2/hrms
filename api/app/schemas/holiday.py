"""Request/response schemas for the Holiday module."""

import uuid
from datetime import date as DateType
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class HolidayCalendarCreate(BaseModel):
    """Payload for creating a holiday calendar."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=100)
    year: int
    location: str | None = None
    is_default: bool = False


class HolidayCalendarUpdate(BaseModel):
    """Partial update payload for a holiday calendar."""

    name: str | None = None
    year: int | None = None
    location: str | None = None
    is_default: bool | None = None


class HolidayCalendarResponse(BaseModel):
    """Full holiday calendar record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    year: int
    location: str | None = None
    is_default: bool
    created_at: datetime
    updated_at: datetime


class HolidayCreate(BaseModel):
    """Payload for creating a holiday."""

    holiday_calendar_id: uuid.UUID
    date: DateType
    name: str = Field(..., min_length=1, max_length=200)
    type: str = Field(default="mandatory", pattern="^(mandatory|optional|restricted)$")
    is_half_day: bool = False


class HolidayUpdate(BaseModel):
    """Partial update payload for a holiday."""

    date: DateType | None = None
    name: str | None = None
    type: str | None = None
    is_half_day: bool | None = None


class HolidayResponse(BaseModel):
    """Full holiday record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    holiday_calendar_id: uuid.UUID
    date: DateType
    name: str
    type: str
    is_half_day: bool
