"""Request/response schemas for the Leave module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class LeaveTypeCreate(BaseModel):
    """Payload for creating a leave type."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)
    is_paid: bool = True
    is_carry_forward: bool = False
    max_carry_forward_days: Decimal | None = None
    is_encashable: bool = False
    is_earned_leave: bool = False
    accrual_frequency: str | None = None
    accrual_amount: Decimal | None = None
    max_balance: Decimal | None = None
    min_consecutive_days: Decimal = Decimal("0.5")
    max_consecutive_days: int | None = None
    applicable_gender: str | None = None
    sandwich_rule_enabled: bool = False


class LeaveTypeUpdate(BaseModel):
    """Partial update payload for a leave type."""

    name: str | None = None
    is_paid: bool | None = None
    is_carry_forward: bool | None = None
    max_carry_forward_days: Decimal | None = None
    is_encashable: bool | None = None
    is_earned_leave: bool | None = None
    accrual_frequency: str | None = None
    accrual_amount: Decimal | None = None
    max_balance: Decimal | None = None
    min_consecutive_days: Decimal | None = None
    max_consecutive_days: int | None = None
    applicable_gender: str | None = None
    sandwich_rule_enabled: bool | None = None
    is_active: bool | None = None


class LeaveTypeResponse(BaseModel):
    """Full leave type record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    code: str
    is_paid: bool
    is_carry_forward: bool
    max_carry_forward_days: Decimal | None = None
    is_encashable: bool
    is_earned_leave: bool
    accrual_frequency: str | None = None
    accrual_amount: Decimal | None = None
    max_balance: Decimal | None = None
    min_consecutive_days: Decimal
    max_consecutive_days: int | None = None
    applicable_gender: str | None = None
    sandwich_rule_enabled: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LeaveApplicationCreate(BaseModel):
    """Payload for submitting a leave application."""

    leave_type_id: uuid.UUID
    from_date: date
    to_date: date
    from_half: str = Field(default="full_day", pattern="^(first_half|second_half|full_day)$")
    to_half: str = Field(default="full_day", pattern="^(first_half|second_half|full_day)$")
    reason: str | None = None


class LeaveApplicationUpdate(BaseModel):
    """Update payload for a leave application (before approval)."""

    from_date: date | None = None
    to_date: date | None = None
    from_half: str | None = None
    to_half: str | None = None
    reason: str | None = None


class LeaveActionRequest(BaseModel):
    """Approve or reject a leave application."""

    status: str = Field(..., pattern="^(approved|rejected)$")
    rejection_reason: str | None = None


class LeaveApplicationResponse(BaseModel):
    """Full leave application record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    from_date: date
    to_date: date
    from_half: str
    to_half: str
    total_days: Decimal
    reason: str | None = None
    status: str
    approved_by: uuid.UUID | None = None
    approved_at: datetime | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class LeaveBalanceResponse(BaseModel):
    """Leave balance for a specific leave type and year."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    year: int
    opening_balance: Decimal
    allocated: Decimal
    accrued: Decimal
    taken: Decimal
    pending: Decimal
    carry_forwarded: Decimal
    encashed: Decimal
    lapsed: Decimal
    current_balance: Decimal


class LeaveAllocationCreate(BaseModel):
    """Payload for allocating leave balance."""

    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    year: int
    allocated: Decimal
