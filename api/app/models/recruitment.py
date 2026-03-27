"""Recruitment module models: job openings and applications."""

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
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class JobOpening(Base, TimestampMixin):
    """Open position / requisition for hiring."""

    __tablename__ = "job_opening"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("department.id"), nullable=True
    )
    designation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("designation.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    employment_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="full_time"
    )
    min_experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    min_salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    max_salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    vacancies: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    filled: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    publish_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    closing_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft"
    )  # draft, open, on_hold, closed, cancelled
    hiring_manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=True
    )
    skills: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)

    # Relationships
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="job_opening")


class JobApplication(Base, TimestampMixin):
    """Candidate application against a job opening."""

    __tablename__ = "job_application"

    job_opening_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_opening.id"), nullable=False, index=True
    )
    applicant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    resume_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # website, referral, linkedin, naukri, etc.
    referral_employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=True
    )
    current_company: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    current_designation: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    expected_salary: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    notice_period_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    stage: Mapped[str] = mapped_column(
        String(30), nullable=False, default="applied"
    )  # applied, screening, shortlisted, interview, selected, rejected, on_hold
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1-5
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skills: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)

    # Relationships
    job_opening: Mapped["JobOpening"] = relationship(back_populates="applications")
