"""Department model with hierarchical parent-child support."""

import uuid
from typing import Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Department(Base, TimestampMixin):
    """Organizational unit within a company, supporting tree hierarchy."""

    __tablename__ = "department"
    __table_args__ = (
        UniqueConstraint("company_id", "name", name="uq_department_company_name"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("company.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    parent_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("department.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    head_employee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employee.id", ondelete="SET NULL"),
        nullable=True,
    )
    cost_center: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="departments")  # noqa: F821
    parent_department: Mapped[Optional["Department"]] = relationship(
        "Department",
        remote_side="Department.id",
        back_populates="sub_departments",
        lazy="selectin",
    )
    sub_departments: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="parent_department",
        lazy="noload",
    )
    employees: Mapped[list["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="department",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<Department name={self.name}>"
