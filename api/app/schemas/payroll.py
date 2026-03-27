"""Request/response schemas for the Payroll module."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- Salary Component ---

class SalaryComponentCreate(BaseModel):
    """Payload for creating a salary component."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    code: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., pattern="^(earning|deduction)$")
    is_taxable: bool = True
    is_flexible: bool = False
    depends_on_payment_days: bool = True
    formula: str | None = None
    description: str | None = None
    sort_order: int = 0


class SalaryComponentUpdate(BaseModel):
    """Partial update payload for a salary component."""

    name: str | None = None
    is_taxable: bool | None = None
    is_flexible: bool | None = None
    depends_on_payment_days: bool | None = None
    formula: str | None = None
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class SalaryComponentResponse(BaseModel):
    """Full salary component record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    code: str
    type: str
    is_taxable: bool
    is_flexible: bool
    depends_on_payment_days: bool
    formula: str | None = None
    description: str | None = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


# --- Salary Structure ---

class SalaryStructureDetailInput(BaseModel):
    """Salary structure detail line item input."""

    salary_component_id: uuid.UUID
    formula: str | None = None
    amount: Decimal | None = None
    percentage: Decimal | None = None
    depends_on: str | None = None
    sort_order: int = 0


class SalaryStructureCreate(BaseModel):
    """Payload for creating a salary structure."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    payroll_frequency: str = "monthly"
    details: list[SalaryStructureDetailInput] = []


class SalaryStructureUpdate(BaseModel):
    """Partial update payload for a salary structure."""

    name: str | None = None
    description: str | None = None
    payroll_frequency: str | None = None
    is_active: bool | None = None
    details: list[SalaryStructureDetailInput] | None = None


class SalaryStructureDetailResponse(BaseModel):
    """Salary structure detail line item response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    salary_component_id: uuid.UUID
    formula: str | None = None
    amount: Decimal | None = None
    percentage: Decimal | None = None
    depends_on: str | None = None
    sort_order: int


class SalaryStructureResponse(BaseModel):
    """Full salary structure record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    description: str | None = None
    payroll_frequency: str
    is_active: bool
    details: list[SalaryStructureDetailResponse] = []
    created_at: datetime
    updated_at: datetime


# --- Salary Structure Assignment ---

class SalaryStructureAssignmentCreate(BaseModel):
    """Payload for assigning a salary structure to an employee."""

    employee_id: uuid.UUID
    salary_structure_id: uuid.UUID
    from_date: date
    to_date: date | None = None
    base_amount: Decimal
    variable_amount: Decimal = Decimal("0")


class SalaryStructureAssignmentResponse(BaseModel):
    """Full salary structure assignment record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    salary_structure_id: uuid.UUID
    from_date: date
    to_date: date | None = None
    base_amount: Decimal
    variable_amount: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime


# --- Payroll Entry ---

class PayrollRunRequest(BaseModel):
    """Payload for triggering a payroll run."""

    company_id: uuid.UUID
    start_date: date
    end_date: date
    posting_date: date


class PayrollEntryResponse(BaseModel):
    """Full payroll entry record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    payroll_frequency: str
    start_date: date
    end_date: date
    posting_date: date
    status: str
    total_gross: Decimal
    total_deductions: Decimal
    total_net: Decimal
    employee_count: int
    created_at: datetime
    updated_at: datetime


# --- Salary Slip ---

class SalarySlipItemResponse(BaseModel):
    """Salary slip line item response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    salary_component_id: uuid.UUID
    type: str
    amount: Decimal
    sort_order: int


class SalarySlipResponse(BaseModel):
    """Full salary slip record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    payroll_entry_id: uuid.UUID | None = None
    salary_structure_id: uuid.UUID
    start_date: date
    end_date: date
    posting_date: date
    total_working_days: int
    payment_days: int
    leave_without_pay_days: Decimal
    gross_pay: Decimal
    total_deductions: Decimal
    net_pay: Decimal
    status: str
    items: list[SalarySlipItemResponse] = []
    created_at: datetime
    updated_at: datetime
