"""Company model for multi-company support."""

from datetime import date
from typing import Optional

from sqlalchemy import Date, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Company(Base, TimestampMixin):
    """Organization / legal entity that employs staff."""

    __tablename__ = "company"
    __table_args__ = (
        UniqueConstraint("name", name="uq_company_name"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    legal_name: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    abbr: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    registration_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tax_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    gst_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    address_line1: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    date_of_incorporation: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fiscal_year_start_month: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")

    # Relationships
    departments: Mapped[list["Department"]] = relationship(  # noqa: F821
        "Department",
        back_populates="company",
        foreign_keys="[Department.company_id]",
        lazy="selectin",
    )
    employees: Mapped[list["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="company",
        foreign_keys="[Employee.company_id]",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<Company name={self.name}>"
