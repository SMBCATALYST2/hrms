"""Attendance module models: shifts, attendance records, punches, regularization."""

import uuid
from datetime import date, datetime, time
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
    Time,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.employee import Employee


class Shift(Base, TimestampMixin):
    """Shift type definitions (e.g., General, Morning, Night)."""

    __tablename__ = "shift"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    grace_period_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    half_day_hours: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False, default=4.00)
    full_day_hours: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False, default=8.00)
    is_night_shift: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    break_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, default=60)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    assignments: Mapped[list["ShiftAssignment"]] = relationship(back_populates="shift")
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(back_populates="shift")


class ShiftAssignment(Base):
    """Maps an employee to a shift for a given date range."""

    __tablename__ = "shift_assignment"
    __table_args__ = (
        UniqueConstraint("employee_id", "effective_from", name="uq_shift_assignment"),
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    shift_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("shift.id"), nullable=False
    )
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )

    # Relationships
    employee: Mapped["Employee"] = relationship(back_populates="shift_assignments")
    shift: Mapped["Shift"] = relationship(back_populates="assignments")


class AttendanceRecord(Base, TimestampMixin):
    """Daily attendance record per employee."""

    __tablename__ = "attendance_record"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_attendance_record"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_in_time: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    check_out_time: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    check_in_source: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    check_out_source: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    shift_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("shift.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="absent"
    )  # present, absent, half_day, on_leave, holiday, week_off, work_from_home, on_duty
    total_hours: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    overtime_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    late_by_minutes: Mapped[int] = mapped_column(Integer, default=0)
    early_exit_minutes: Mapped[int] = mapped_column(Integer, default=0)
    geo_check_in_lat: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    geo_check_in_lng: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    geo_check_out_lat: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    geo_check_out_lng: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    is_regularized: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    employee: Mapped["Employee"] = relationship(back_populates="attendance_records")
    shift: Mapped[Optional["Shift"]] = relationship(back_populates="attendance_records")


class AttendancePunch(Base):
    """Individual check-in/check-out punch events."""

    __tablename__ = "attendance_punch"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    punch_time: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    punch_type: Mapped[str] = mapped_column(String(5), nullable=False)  # in, out
    source: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # biometric, geo, web, manual, mobile
    device_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    geo_lat: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    geo_lng: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 7), nullable=True)
    is_mock_location: Mapped[bool] = mapped_column(Boolean, default=False)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )


class AttendanceRegularization(Base, TimestampMixin):
    """Attendance regularization requests (for missed/incorrect punches)."""

    __tablename__ = "attendance_regularization"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    original_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    requested_status: Mapped[str] = mapped_column(String(20), nullable=False)
    requested_check_in: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    requested_check_out: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # pending, approved, rejected
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )


class OvertimePolicy(Base):
    """Company-level overtime calculation rules."""

    __tablename__ = "overtime_policy"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    min_hours_for_ot: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False)
    rate_multiplier_weekday: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False, default=1.5)
    rate_multiplier_weekend: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False, default=2.0)
    rate_multiplier_holiday: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False, default=2.0)
    max_ot_hours_per_day: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    max_ot_hours_per_month: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    requires_pre_approval: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )


class OvertimeEntry(Base):
    """Individual overtime log entries."""

    __tablename__ = "overtime_entry"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenant.id"), nullable=False, index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    rate_multiplier: Mapped[Decimal] = mapped_column(Numeric(3, 1), nullable=False)
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    overtime_policy_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("overtime_policy.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # pending, approved, rejected
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id"), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default="now()", nullable=False
    )
