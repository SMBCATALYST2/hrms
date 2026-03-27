"""Request/response schemas for the Company module."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CompanyCreate(BaseModel):
    """Payload for creating a new company."""

    name: str = Field(..., min_length=1, max_length=200)
    legal_name: str | None = None
    abbr: str | None = Field(default=None, max_length=10)
    registration_number: str | None = None
    tax_id: str | None = None
    gst_number: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "India"
    pincode: str | None = None
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    date_of_incorporation: date | None = None
    fiscal_year_start_month: int = Field(default=4, ge=1, le=12)


class CompanyUpdate(BaseModel):
    """Partial update payload for an existing company."""

    name: str | None = None
    legal_name: str | None = None
    abbr: str | None = None
    registration_number: str | None = None
    tax_id: str | None = None
    gst_number: str | None = None
    logo_url: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    date_of_incorporation: date | None = None
    fiscal_year_start_month: int | None = None
    status: str | None = None


class CompanyResponse(BaseModel):
    """Full company record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    legal_name: str | None = None
    abbr: str | None = None
    registration_number: str | None = None
    tax_id: str | None = None
    gst_number: str | None = None
    logo_url: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str
    pincode: str | None = None
    industry: str | None = None
    website: str | None = None
    phone: str | None = None
    email: str | None = None
    date_of_incorporation: date | None = None
    fiscal_year_start_month: int
    status: str
    created_at: datetime
    updated_at: datetime
