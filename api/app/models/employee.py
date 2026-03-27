"""Employee model -- comprehensive Frappe-style HR record with 30+ fields."""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    TIMESTAMP,
    CheckConstraint,
    Date,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import AuditMixin, Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.department import Department
    from app.models.designation import Designation
    from app.models.user import User


class Employee(Base, TimestampMixin, AuditMixin):
    """Core employee record covering personal, professional, and organizational data."""

    __tablename__ = "employee"
    __table_args__ = (
        UniqueConstraint("employee_code", name="uq_employee_code"),
        UniqueConstraint("email", name="uq_employee_email"),
        CheckConstraint("reporting_manager_id != id", name="ck_employee_manager_not_self"),
    )

    # Identification
    employee_code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Contact
    email: Mapped[str] = mapped_column(String(256), nullable=False)
    personal_email: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    personal_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Personal
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)  # male, female, other, prefer_not_to_say
    marital_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(5), nullable=True)
    nationality: Mapped[str] = mapped_column(String(50), nullable=False, default="Indian")
    religion: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Organization
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("company.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("department.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    designation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("designation.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    reporting_manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employee.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    employee_grade: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Employment
    date_of_joining: Mapped[date] = mapped_column(Date, nullable=False)
    date_of_confirmation: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    probation_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    date_of_retirement: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    date_of_exit: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", index=True,
    )  # draft, active, on_notice, suspended, resigned, relieved, terminated
    employment_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="full_time",
    )  # full_time, part_time, contract, intern, consultant
    notice_period_days: Mapped[int] = mapped_column(Integer, nullable=False, default=90)
    relieving_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    work_location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    work_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="onsite")  # onsite, hybrid, remote

    # Address
    current_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    permanent_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Emergency contact
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    emergency_contact_relation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Bank & financial
    bank_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    bank_account_no: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pan_number: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    aadhaar_number: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)  # encrypted
    uan_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Profile
    profile_photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="employees", lazy="selectin")
    department: Mapped[Optional["Department"]] = relationship(
        "Department", back_populates="employees", lazy="selectin",
    )
    designation: Mapped[Optional["Designation"]] = relationship(
        "Designation", back_populates="employees", lazy="selectin",
    )
    reporting_manager: Mapped[Optional["Employee"]] = relationship(
        "Employee",
        remote_side="Employee.id",
        foreign_keys=[reporting_manager_id],
        lazy="selectin",
    )
    direct_reports: Mapped[list["Employee"]] = relationship(
        "Employee",
        foreign_keys=[reporting_manager_id],
        lazy="noload",
    )
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="employee",
        uselist=False,
        lazy="noload",
    )

    @property
    def full_name(self) -> str:
        """Compute full name from name parts."""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return " ".join(parts)

    def __repr__(self) -> str:
        return f"<Employee code={self.employee_code} name={self.full_name}>"
