"""Request/response schemas for the Recruitment module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class JobOpeningCreate(BaseModel):
    """Payload for creating a job opening."""

    company_id: uuid.UUID
    department_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    requirements: str | None = None
    location: str | None = None
    employment_type: str = "full_time"
    min_experience_years: int | None = None
    max_experience_years: int | None = None
    min_salary: Decimal | None = None
    max_salary: Decimal | None = None
    currency: str = "INR"
    vacancies: int = 1
    closing_date: date | None = None
    hiring_manager_id: uuid.UUID | None = None
    skills: list[str] | None = None


class JobOpeningUpdate(BaseModel):
    """Partial update payload for a job opening."""

    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    location: str | None = None
    employment_type: str | None = None
    min_experience_years: int | None = None
    max_experience_years: int | None = None
    min_salary: Decimal | None = None
    max_salary: Decimal | None = None
    vacancies: int | None = None
    closing_date: date | None = None
    status: str | None = None
    hiring_manager_id: uuid.UUID | None = None
    skills: list[str] | None = None


class JobOpeningResponse(BaseModel):
    """Full job opening record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    department_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    requirements: str | None = None
    location: str | None = None
    employment_type: str
    min_experience_years: int | None = None
    max_experience_years: int | None = None
    min_salary: Decimal | None = None
    max_salary: Decimal | None = None
    currency: str
    vacancies: int
    filled: int
    publish_date: date | None = None
    closing_date: date | None = None
    status: str
    hiring_manager_id: uuid.UUID | None = None
    skills: list | None = None
    created_at: datetime
    updated_at: datetime


class JobApplicationCreate(BaseModel):
    """Payload for submitting a job application."""

    job_opening_id: uuid.UUID
    applicant_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = None
    resume_url: str | None = None
    cover_letter: str | None = None
    source: str | None = None
    referral_employee_id: uuid.UUID | None = None
    current_company: str | None = None
    current_designation: str | None = None
    experience_years: int | None = None
    current_salary: Decimal | None = None
    expected_salary: Decimal | None = None
    notice_period_days: int | None = None
    skills: list[str] | None = None


class JobApplicationUpdate(BaseModel):
    """Partial update payload for a job application."""

    applicant_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    resume_url: str | None = None
    notes: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class StageUpdateRequest(BaseModel):
    """Payload for updating a job application's pipeline stage."""

    stage: str = Field(
        ...,
        pattern="^(applied|screening|shortlisted|interview|selected|rejected|on_hold)$",
    )
    notes: str | None = None


class JobApplicationResponse(BaseModel):
    """Full job application record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_opening_id: uuid.UUID
    applicant_name: str
    email: str
    phone: str | None = None
    resume_url: str | None = None
    cover_letter: str | None = None
    source: str | None = None
    referral_employee_id: uuid.UUID | None = None
    current_company: str | None = None
    current_designation: str | None = None
    experience_years: int | None = None
    current_salary: Decimal | None = None
    expected_salary: Decimal | None = None
    notice_period_days: int | None = None
    stage: str
    rating: int | None = None
    notes: str | None = None
    skills: list | None = None
    created_at: datetime
    updated_at: datetime
