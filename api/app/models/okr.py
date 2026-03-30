"""OKR module models: cycles, objectives, key results, and check-ins."""

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


class OKRCycle(Base, TimestampMixin):
    """Time-bounded OKR cycle (quarterly, annual, etc.)."""

    __tablename__ = "okr_cycle"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, active, closed
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    objectives: Mapped[list["Objective"]] = relationship(back_populates="cycle")


class Objective(Base, TimestampMixin):
    """OKR Objective owned by an employee, team, or company."""

    __tablename__ = "objective"

    cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("okr_cycle.id"), nullable=False, index=True
    )
    owner_employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False, index=True
    )
    parent_objective_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("objective.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scope: Mapped[str] = mapped_column(
        String(20), nullable=False, default="individual"
    )  # company, department, team, individual
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("department.id"), nullable=True
    )
    progress: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started"
    )  # not_started, on_track, behind, at_risk, completed, cancelled
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=1)

    # Relationships
    cycle: Mapped["OKRCycle"] = relationship(back_populates="objectives")
    key_results: Mapped[list["KeyResult"]] = relationship(back_populates="objective")
    parent: Mapped[Optional["Objective"]] = relationship(
        remote_side="Objective.id", foreign_keys=[parent_objective_id], back_populates="children"
    )
    children: Mapped[list["Objective"]] = relationship(
        foreign_keys=[parent_objective_id], back_populates="parent"
    )


class KeyResult(Base, TimestampMixin):
    """Measurable key result under an objective."""

    __tablename__ = "key_result"

    objective_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("objective.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    owner_employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metric_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="number"
    )  # number, percentage, currency, boolean
    start_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    target_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    current_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=0)
    unit: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    progress: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=1)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started"
    )  # not_started, on_track, behind, at_risk, completed

    # Relationships
    objective: Mapped["Objective"] = relationship(back_populates="key_results")
    check_ins: Mapped[list["OKRCheckIn"]] = relationship(back_populates="key_result")


class OKRCheckIn(Base, TimestampMixin):
    """Periodic progress update on a key result."""

    __tablename__ = "okr_check_in"

    key_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("key_result.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    previous_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    new_value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence_level: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # high, medium, low
