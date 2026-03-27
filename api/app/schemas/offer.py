"""Request/response schemas for the Offer module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class JobOfferCreate(BaseModel):
    """Payload for creating a job offer."""

    job_application_id: uuid.UUID
    offer_template_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    offered_salary: Decimal
    currency: str = "INR"
    offer_date: date
    valid_until: date
    expected_joining_date: date | None = None
    terms: str | None = None


class JobOfferActionRequest(BaseModel):
    """Approve or send a job offer."""

    action: str = Field(..., pattern="^(approve|send)$")


class JobOfferResponse(BaseModel):
    """Full job offer record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_application_id: uuid.UUID
    offer_template_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    offered_salary: Decimal
    currency: str
    offer_date: date
    valid_until: date
    expected_joining_date: date | None = None
    terms: str | None = None
    status: str
    approved_by: uuid.UUID | None = None
    approved_at: datetime | None = None
    sent_at: datetime | None = None
    responded_at: datetime | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime
