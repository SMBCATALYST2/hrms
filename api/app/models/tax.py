"""Tax module models: income tax slabs, declarations, and proof submissions."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class IncomeTaxSlab(Base, TimestampMixin):
    """Tax slab regime (old/new) applicable for a fiscal year."""

    __tablename__ = "income_tax_slab"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    regime: Mapped[str] = mapped_column(String(10), nullable=False)  # old, new
    fiscal_year: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    rates: Mapped[list["TaxSlabRate"]] = relationship(
        back_populates="tax_slab", cascade="all, delete-orphan"
    )


class TaxSlabRate(Base):
    """Individual rate bracket within a tax slab."""

    __tablename__ = "tax_slab_rate"

    tax_slab_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("income_tax_slab.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    from_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    to_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    surcharge_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    cess_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=4)

    # Relationships
    tax_slab: Mapped["IncomeTaxSlab"] = relationship(back_populates="rates")


class TaxDeclaration(Base, TimestampMixin):
    """Employee's annual tax declaration for deductions under various sections."""

    __tablename__ = "tax_declaration"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    fiscal_year: Mapped[int] = mapped_column(Integer, nullable=False)
    regime: Mapped[str] = mapped_column(String(10), nullable=False, default="new")  # old, new
    total_declared_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    total_verified_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, submitted, verified

    # Relationships
    items: Mapped[list["TaxDeclarationItem"]] = relationship(
        back_populates="declaration", cascade="all, delete-orphan"
    )


class TaxDeclarationItem(Base):
    """Individual deduction item in a tax declaration."""

    __tablename__ = "tax_declaration_item"

    declaration_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tax_declaration.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    section: Mapped[str] = mapped_column(String(20), nullable=False)  # 80C, 80D, HRA, etc.
    description: Mapped[str] = mapped_column(String(300), nullable=False)
    declared_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    verified_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    proof_submitted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    declaration: Mapped["TaxDeclaration"] = relationship(back_populates="items")
