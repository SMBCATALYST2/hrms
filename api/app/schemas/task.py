"""Request/response schemas for the Task module."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    """Payload for creating a task."""

    company_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    assigned_to_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    due_date: date | None = None
    tags: list[str] | None = None
    parent_task_id: uuid.UUID | None = None


class TaskUpdate(BaseModel):
    """Partial update payload for a task."""

    title: str | None = None
    description: str | None = None
    assigned_to_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None
    tags: list[str] | None = None


class TaskStatusUpdate(BaseModel):
    """Payload for updating a task's status."""

    status: str = Field(
        ..., pattern="^(open|in_progress|review|completed|cancelled)$"
    )


class TaskAssignRequest(BaseModel):
    """Payload for assigning a task."""

    assigned_to_id: uuid.UUID


class TaskResponse(BaseModel):
    """Full task record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    title: str
    description: str | None = None
    assigned_to_id: uuid.UUID | None = None
    assigned_by_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    priority: str
    status: str
    due_date: date | None = None
    completed_at: datetime | None = None
    tags: list | None = None
    ai_priority_score: int | None = None
    parent_task_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class TaskCommentCreate(BaseModel):
    """Payload for adding a comment to a task."""

    content: str = Field(..., min_length=1)


class TaskCommentResponse(BaseModel):
    """Full task comment record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    task_id: uuid.UUID
    employee_id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime
