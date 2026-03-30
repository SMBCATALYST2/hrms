"""Leave module models: leave types, policies, balances, applications, comp-off."""

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

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

if TYPE_CHECKING:
    from app.models.employee import Employee


class LeaveType(Base, TimestampMixin):
    """Definition of a leave type (Casual, Sick, Earned, etc.)."""

    __tablename__ = "leave_type"
    __table_args__ = (
        UniqueConstraint("company_id", "code", name="uq_leave_type_company_code"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    is_paid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_carry_forward: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    max_carry_forward_days: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 1), nullable=True)
    carry_forward_expiry_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_encashable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    encashment_rate_per_day: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    is_earned_leave: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    accrual_frequency: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # monthly, quarterly, yearly
    accrual_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    max_balance: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 1), nullable=True)
    min_consecutive_days: Mapped[Decimal] = mapped_column(Numeric(3, 1), default=0.5)
    max_consecutive_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    applicable_gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    requires_attachment_after_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sandwich_rule_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    policy_details: Mapped[list["LeavePolicyDetail"]] = relationship(back_populates="leave_type")
    balances: Mapped[list["LeaveBalance"]] = relationship(back_populates="leave_type")
    applications: Mapped[list["LeaveApplication"]] = relationship(back_populates="leave_type")


class LeavePolicy(Base, TimestampMixin):
    """A policy grouping leave type allocations for a company."""

    __tablename__ = "leave_policy"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    applicable_to: Mapped[str] = mapped_column(
        String(50), nullable=False, default="all"
    )  # all, designation, department, employment_type
    applicable_filter: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    details: Mapped[list["LeavePolicyDetail"]] = relationship(
        back_populates="leave_policy", cascade="all, delete-orphan"
    )


class LeavePolicyDetail(Base):
    """Maps a leave type to a policy with an annual allocation."""

    __tablename__ = "leave_policy_detail"
    __table_args__ = (
        UniqueConstraint("leave_policy_id", "leave_type_id", name="uq_leave_policy_detail"),
    )

    leave_policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leave_policy.id"), nullable=False, index=True
    )
    leave_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leave_type.id"), nullable=False
    )
    annual_allocation: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    pro_rata_from_joining: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    leave_policy: Mapped["LeavePolicy"] = relationship(back_populates="details")
    leave_type: Mapped["LeaveType"] = relationship(back_populates="policy_details")


class LeaveBalance(Base, TimestampMixin):
    """Annual leave balance per employee per leave type."""

    __tablename__ = "leave_balance"
    __table_args__ = (
        UniqueConstraint("employee_id", "leave_type_id", "year", name="uq_leave_balance"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    leave_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leave_type.id"), nullable=False
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    opening_balance: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    allocated: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    accrued: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    taken: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    pending: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    carry_forwarded: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    encashed: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)
    lapsed: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False, default=0)

    # Relationships
    employee: Mapped["Employee"] = relationship()
    leave_type: Mapped["LeaveType"] = relationship(back_populates="balances")

    @property
    def current_balance(self) -> Decimal:
        """Computed balance = opening + allocated + accrued + carry_forwarded - taken - pending - encashed - lapsed."""
        return (
            self.opening_balance
            + self.allocated
            + self.accrued
            + self.carry_forwarded
            - self.taken
            - self.pending
            - self.encashed
            - self.lapsed
        )


class LeaveApplication(Base, TimestampMixin):
    """A leave application request submitted by an employee."""

    __tablename__ = "leave_application"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    leave_type_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leave_type.id"), nullable=False
    )
    from_date: Mapped[date] = mapped_column(Date, nullable=False)
    to_date: Mapped[date] = mapped_column(Date, nullable=False)
    from_half: Mapped[str] = mapped_column(
        String(20), default="full_day"
    )  # first_half, second_half, full_day
    to_half: Mapped[str] = mapped_column(String(20), default="full_day")
    total_days: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attachment_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # draft, pending, approved, rejected, cancelled
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    employee: Mapped["Employee"] = relationship()
    leave_type: Mapped["LeaveType"] = relationship(back_populates="applications")


class CompensatoryOff(Base):
    """Compensatory off earned for working on a holiday/week-off."""

    __tablename__ = "compensatory_off"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    work_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    leave_application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leave_application.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending_approval"
    )  # pending_approval, available, used, expired
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )
