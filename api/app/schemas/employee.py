"""Request/response schemas for the Employee module."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeCreate(BaseModel):
    """Payload for creating a new employee."""

    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: str | None = None
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    personal_email: EmailStr | None = None
    phone: str | None = None
    personal_phone: str | None = None
    date_of_birth: date
    gender: str = Field(..., pattern="^(male|female|other|prefer_not_to_say)$")
    marital_status: str | None = None
    blood_group: str | None = None
    nationality: str = "Indian"
    religion: str | None = None
    company_id: uuid.UUID
    department_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    reporting_manager_id: uuid.UUID | None = None
    employee_grade: str | None = None
    date_of_joining: date
    employment_type: str = Field(default="full_time", pattern="^(full_time|part_time|contract|intern|consultant)$")
    notice_period_days: int = 90
    work_location: str | None = None
    work_mode: str = Field(default="onsite", pattern="^(onsite|hybrid|remote)$")
    current_address: str | None = None
    permanent_address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_relation: str | None = None
    bank_name: str | None = None
    bank_account_no: str | None = None
    ifsc_code: str | None = None
    pan_number: str | None = None
    aadhaar_number: str | None = None
    uan_number: str | None = None


class EmployeeUpdate(BaseModel):
    """Partial update payload for an existing employee."""

    first_name: str | None = None
    middle_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    personal_email: EmailStr | None = None
    phone: str | None = None
    personal_phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    marital_status: str | None = None
    blood_group: str | None = None
    nationality: str | None = None
    religion: str | None = None
    company_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    designation_id: uuid.UUID | None = None
    reporting_manager_id: uuid.UUID | None = None
    employee_grade: str | None = None
    date_of_joining: date | None = None
    date_of_confirmation: date | None = None
    date_of_retirement: date | None = None
    status: str | None = None
    employment_type: str | None = None
    notice_period_days: int | None = None
    relieving_date: date | None = None
    work_location: str | None = None
    work_mode: str | None = None
    current_address: str | None = None
    permanent_address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_relation: str | None = None
    bank_name: str | None = None
    bank_account_no: str | None = None
    ifsc_code: str | None = None
    pan_number: str | None = None
    aadhaar_number: str | None = None
    uan_number: str | None = None
    profile_photo_url: str | None = None


class EmployeeResponse(BaseModel):
    """Full employee record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_code: str
    first_name: str
    middle_name: str | None = None
    last_name: str
    full_name: str
    email: str
    personal_email: str | None = None
    phone: str | None = None
    personal_phone: str | None = None
    date_of_birth: date
    gender: str
    marital_status: str | None = None
    blood_group: str | None = None
    nationality: str
    religion: str | None = None
    company_id: uuid.UUID
    company_name: str | None = None
    department_id: uuid.UUID | None = None
    department_name: str | None = None
    designation_id: uuid.UUID | None = None
    designation_name: str | None = None
    reporting_manager_id: uuid.UUID | None = None
    reporting_manager_name: str | None = None
    employee_grade: str | None = None
    date_of_joining: date
    date_of_confirmation: date | None = None
    date_of_retirement: date | None = None
    date_of_exit: date | None = None
    status: str
    employment_type: str
    notice_period_days: int
    relieving_date: date | None = None
    work_location: str | None = None
    work_mode: str
    current_address: str | None = None
    permanent_address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_relation: str | None = None
    bank_name: str | None = None
    ifsc_code: str | None = None
    uan_number: str | None = None
    profile_photo_url: str | None = None
    created_at: datetime
    updated_at: datetime


class EmployeeListItem(BaseModel):
    """Lightweight employee record for list / directory views."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_code: str
    full_name: str
    email: str
    phone: str | None = None
    department_name: str | None = None
    designation_name: str | None = None
    status: str
    employment_type: str
    date_of_joining: date
    profile_photo_url: str | None = None


class OrgChartNode(BaseModel):
    """Single node in an org-chart tree response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_code: str
    full_name: str
    designation_name: str | None = None
    department_name: str | None = None
    profile_photo_url: str | None = None
    children: list["OrgChartNode"] = []
