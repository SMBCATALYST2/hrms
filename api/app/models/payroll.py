"""Payroll module models: salary structures, components, slips, and payroll entries."""

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
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class SalaryComponent(Base, TimestampMixin):
    """Individual salary component (e.g., Basic, HRA, PF, Tax)."""

    __tablename__ = "salary_component"
    __table_args__ = (
        UniqueConstraint("company_id", "code", name="uq_salary_component_company_code"),
    )

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # earning, deduction
    is_taxable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_flexible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    depends_on_payment_days: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class SalaryStructure(Base, TimestampMixin):
    """Template defining salary breakup for a group of employees."""

    __tablename__ = "salary_structure"
    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_salary_structure_company_name"),
    )

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payroll_frequency: Mapped[str] = mapped_column(
        String(20), nullable=False, default="monthly"
    )  # monthly, biweekly, weekly
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    details: Mapped[list["SalaryStructureDetail"]] = relationship(
        back_populates="salary_structure", cascade="all, delete-orphan"
    )
    assignments: Mapped[list["SalaryStructureAssignment"]] = relationship(
        back_populates="salary_structure"
    )


class SalaryStructureDetail(Base):
    """Line item in a salary structure mapping to a component."""

    __tablename__ = "salary_structure_detail"
    __table_args__ = (
        UniqueConstraint(
            "salary_structure_id", "salary_component_id",
            name="uq_salary_structure_detail",
        ),
    )

    salary_structure_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_structure.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    salary_component_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_component.id"), nullable=False
    )
    formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    percentage: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    depends_on: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # component code this depends on (e.g., "basic")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    salary_structure: Mapped["SalaryStructure"] = relationship(back_populates="details")
    salary_component: Mapped["SalaryComponent"] = relationship()


class SalaryStructureAssignment(Base, TimestampMixin):
    """Assigns a salary structure and base pay to an employee."""

    __tablename__ = "salary_structure_assignment"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    salary_structure_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_structure.id"), nullable=False
    )
    from_date: Mapped[date] = mapped_column(Date, nullable=False)
    to_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    base_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    variable_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    salary_structure: Mapped["SalaryStructure"] = relationship(back_populates="assignments")


class PayrollEntry(Base, TimestampMixin):
    """Batch payroll run for a company and pay period."""

    __tablename__ = "payroll_entry"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    payroll_frequency: Mapped[str] = mapped_column(String(20), nullable=False, default="monthly")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    posting_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, submitted, completed, cancelled
    total_gross: Mapped[Decimal] = mapped_column(Numeric(16, 2), nullable=False, default=0)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(16, 2), nullable=False, default=0)
    total_net: Mapped[Decimal] = mapped_column(Numeric(16, 2), nullable=False, default=0)
    employee_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    salary_slips: Mapped[list["SalarySlip"]] = relationship(back_populates="payroll_entry")


class SalarySlip(Base, TimestampMixin):
    """Individual salary slip generated for an employee in a pay period."""

    __tablename__ = "salary_slip"
    __table_args__ = (
        UniqueConstraint("employee_id", "start_date", "end_date", name="uq_salary_slip_period"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    payroll_entry_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("payroll_entry.id"), nullable=True
    )
    salary_structure_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_structure.id"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    posting_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_working_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    payment_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    leave_without_pay_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    gross_pay: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    total_deductions: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    net_pay: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, submitted, completed, cancelled
    payment_mode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # bank, cash, cheque
    bank_account: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    payroll_entry: Mapped[Optional["PayrollEntry"]] = relationship(back_populates="salary_slips")
    items: Mapped[list["SalarySlipItem"]] = relationship(
        back_populates="salary_slip", cascade="all, delete-orphan"
    )


class SalarySlipItem(Base):
    """Individual earnings/deduction line on a salary slip."""

    __tablename__ = "salary_slip_item"

    salary_slip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_slip.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    salary_component_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_component.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # earning, deduction
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    salary_slip: Mapped["SalarySlip"] = relationship(back_populates="items")
    salary_component: Mapped["SalaryComponent"] = relationship()


class AdditionalSalary(Base, TimestampMixin):
    """One-off additional earnings/deductions outside the regular structure."""

    __tablename__ = "additional_salary"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    salary_component_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("salary_component.id"), nullable=False
    )
    payroll_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # earning, deduction
    is_recurring: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    from_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    to_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, submitted, cancelled
