"""Task module models: tasks and task comments."""

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
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Task(Base, TimestampMixin):
    """Task / to-do item that can be assigned to employees."""

    __tablename__ = "task"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assigned_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=True, index=True
    )
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=True
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("department.id"), nullable=True
    )
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium"
    )  # low, medium, high, urgent
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open"
    )  # open, in_progress, review, completed, cancelled
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    ai_priority_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    parent_task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("task.id"), nullable=True
    )

    # Relationships
    comments: Mapped[list["TaskComment"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )
    subtasks: Mapped[list["Task"]] = relationship(
        back_populates="parent_task",
    )
    parent_task: Mapped[Optional["Task"]] = relationship(
        remote_side="Task.id", back_populates="subtasks"
    )


class TaskComment(Base, TimestampMixin):
    """Comment / update on a task."""

    __tablename__ = "task_comment"

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("task.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employee.id"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    task: Mapped["Task"] = relationship(back_populates="comments")
