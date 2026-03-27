"""Request/response schemas for the Attendance module."""

import uuid
from datetime import date, datetime, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CheckInRequest(BaseModel):
    """Payload for employee check-in."""

    source: str = Field(default="web", pattern="^(biometric|geo|web|manual|mobile)$")
    geo_lat: Decimal | None = None
    geo_lng: Decimal | None = None
    device_id: str | None = None


class CheckOutRequest(BaseModel):
    """Payload for employee check-out."""

    source: str = Field(default="web", pattern="^(biometric|geo|web|manual|mobile)$")
    geo_lat: Decimal | None = None
    geo_lng: Decimal | None = None


class RegularizationRequest(BaseModel):
    """Payload for attendance regularization request."""

    date: date
    requested_status: str = Field(..., pattern="^(present|half_day|work_from_home|on_duty)$")
    requested_check_in: datetime | None = None
    requested_check_out: datetime | None = None
    reason: str = Field(..., min_length=5)


class RegularizationActionRequest(BaseModel):
    """Approve or reject a regularization request."""

    status: str = Field(..., pattern="^(approved|rejected)$")


class AttendanceRecordResponse(BaseModel):
    """Full attendance record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None
    check_in_source: str | None = None
    check_out_source: str | None = None
    shift_id: uuid.UUID | None = None
    status: str
    total_hours: Decimal | None = None
    overtime_hours: Decimal
    late_by_minutes: int
    early_exit_minutes: int
    is_regularized: bool
    remarks: str | None = None
    created_at: datetime
    updated_at: datetime


class AttendanceSummary(BaseModel):
    """Monthly attendance summary for an employee."""

    employee_id: uuid.UUID
    month: int
    year: int
    total_present: int = 0
    total_absent: int = 0
    total_half_day: int = 0
    total_on_leave: int = 0
    total_holidays: int = 0
    total_late: int = 0
    total_early_exit: int = 0
    total_overtime_hours: Decimal = Decimal("0")
    total_working_hours: Decimal = Decimal("0")


class RegularizationResponse(BaseModel):
    """Regularization request response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    original_status: str | None = None
    requested_status: str
    requested_check_in: datetime | None = None
    requested_check_out: datetime | None = None
    reason: str
    status: str
    approved_by: uuid.UUID | None = None
    approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
