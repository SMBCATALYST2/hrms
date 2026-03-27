"""Request/response schemas for the Notification module."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    """Full notification record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    type: str
    category: str | None = None
    reference_type: str | None = None
    reference_id: uuid.UUID | None = None
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime


class UnreadCountResponse(BaseModel):
    """Unread notification count."""

    count: int
