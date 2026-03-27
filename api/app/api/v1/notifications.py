"""Notification routes: list, mark-read, count-unread."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.utils.pagination import paginate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[NotificationResponse])
async def list_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """List notifications for the current user."""
    query = select(Notification).where(Notification.user_id == current_user.id)
    return await paginate(db, query, params, NotificationResponse)


@router.patch("/{notification_id}/read", response_model=SuccessResponse)
async def mark_read(
    notification_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Mark a notification as read."""
    from datetime import UTC, datetime

    result = await db.execute(
        select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == current_user.id)
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    notif.read_at = datetime.now(UTC)
    await db.flush()
    return SuccessResponse(message="Notification marked as read")


@router.post("/mark-all-read", response_model=SuccessResponse)
async def mark_all_read(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Mark all notifications as read for the current user."""
    from datetime import UTC, datetime

    result = await db.execute(
        select(Notification).where(
            and_(Notification.user_id == current_user.id, Notification.is_read == False)
        )
    )
    notifications = result.scalars().all()
    now = datetime.now(UTC)
    for notif in notifications:
        notif.is_read = True
        notif.read_at = now
    await db.flush()
    return SuccessResponse(message=f"Marked {len(notifications)} notifications as read")


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get count of unread notifications."""
    result = await db.execute(
        select(func.count(Notification.id)).where(
            and_(Notification.user_id == current_user.id, Notification.is_read == False)
        )
    )
    count = result.scalar() or 0
    return UnreadCountResponse(count=count)
