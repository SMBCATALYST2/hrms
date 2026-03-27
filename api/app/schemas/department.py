"""Request/response schemas for the Department module."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DepartmentCreate(BaseModel):
    """Payload for creating a new department."""

    name: str = Field(..., min_length=1, max_length=200)
    code: str | None = Field(default=None, max_length=20)
    company_id: uuid.UUID
    parent_department_id: uuid.UUID | None = None
    head_employee_id: uuid.UUID | None = None
    cost_center: str | None = None


class DepartmentUpdate(BaseModel):
    """Partial update payload for an existing department."""

    name: str | None = None
    code: str | None = None
    company_id: uuid.UUID | None = None
    parent_department_id: uuid.UUID | None = None
    head_employee_id: uuid.UUID | None = None
    cost_center: str | None = None
    status: str | None = None


class DepartmentResponse(BaseModel):
    """Full department record returned from the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str | None = None
    company_id: uuid.UUID
    parent_department_id: uuid.UUID | None = None
    head_employee_id: uuid.UUID | None = None
    cost_center: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


class DepartmentTreeNode(BaseModel):
    """Recursive node for department tree/hierarchy endpoint."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str | None = None
    status: str
    children: list["DepartmentTreeNode"] = []
