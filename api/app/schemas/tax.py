"""Request/response schemas for the Tax module."""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TaxSlabRateInput(BaseModel):
    """Tax slab rate input."""

    from_amount: Decimal
    to_amount: Decimal | None = None
    rate: Decimal
    surcharge_rate: Decimal = Decimal("0")
    cess_rate: Decimal = Decimal("4")


class IncomeTaxSlabCreate(BaseModel):
    """Payload for creating an income tax slab."""

    company_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=200)
    regime: str = Field(..., pattern="^(old|new)$")
    fiscal_year: int
    rates: list[TaxSlabRateInput] = []


class TaxSlabRateResponse(BaseModel):
    """Tax slab rate response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_amount: Decimal
    to_amount: Decimal | None = None
    rate: Decimal
    surcharge_rate: Decimal
    cess_rate: Decimal


class IncomeTaxSlabResponse(BaseModel):
    """Full income tax slab record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    regime: str
    fiscal_year: int
    is_active: bool
    rates: list[TaxSlabRateResponse] = []
    created_at: datetime
    updated_at: datetime


class TaxDeclarationItemInput(BaseModel):
    """Tax declaration item input."""

    section: str
    description: str
    declared_amount: Decimal


class TaxDeclarationCreate(BaseModel):
    """Payload for creating/submitting a tax declaration."""

    fiscal_year: int
    regime: str = "new"
    items: list[TaxDeclarationItemInput] = []


class TaxDeclarationItemResponse(BaseModel):
    """Tax declaration item response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section: str
    description: str
    declared_amount: Decimal
    verified_amount: Decimal
    proof_submitted: bool


class TaxDeclarationResponse(BaseModel):
    """Full tax declaration record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    fiscal_year: int
    regime: str
    total_declared_amount: Decimal
    total_verified_amount: Decimal
    status: str
    items: list[TaxDeclarationItemResponse] = []
    created_at: datetime
    updated_at: datetime
