"""Request/response schemas for the Designation module."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DesignationCreate(BaseModel):
    """Payload for creating a new designation."""

    name: str = Field(..., min_length=1, max_length=200)
    level: int | None = None
    pay_grade: str | None = Field(default=None, max_length=20)
    description: str | None = None


class DesignationUpdate(BaseModel):
    """Partial update payload for an existing designation."""

    name: str | None = None
    level: int | None = None
    pay_grade: str | None = None
    description: str | None = None
    status: str | None = None


class DesignationResponse(BaseModel):
    """Full designation record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    level: int | None = None
    pay_grade: str | None = None
    description: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
