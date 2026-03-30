"""Designation model for job titles and pay grades."""

from typing import Optional

from sqlalchemy import Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Designation(Base, TimestampMixin):
    """Job title / position with optional level and pay grade."""

    __tablename__ = "designation"
    __table_args__ = (
        UniqueConstraint("name", name="uq_designation_name"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pay_grade: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")

    # Relationships
    employees: Mapped[list["Employee"]] = relationship(  # noqa: F821
        "Employee",
        back_populates="designation",
        foreign_keys="[Employee.designation_id]",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<Designation name={self.name}>"
