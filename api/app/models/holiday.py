"""Holiday models: holiday calendars and individual holidays."""

import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Date,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class HolidayCalendar(Base, TimestampMixin):
    """Annual holiday calendar per company/location."""

    __tablename__ = "holiday_calendar"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    holidays: Mapped[list["Holiday"]] = relationship(
        back_populates="calendar", cascade="all, delete-orphan"
    )


class Holiday(Base):
    """Individual holiday entry within a calendar."""

    __tablename__ = "holiday"
    __table_args__ = (
        UniqueConstraint("holiday_calendar_id", "date", name="uq_holiday_calendar_date"),
    )

    holiday_calendar_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("holiday_calendar.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # mandatory, optional, restricted
    is_half_day: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    calendar: Mapped["HolidayCalendar"] = relationship(back_populates="holidays")
