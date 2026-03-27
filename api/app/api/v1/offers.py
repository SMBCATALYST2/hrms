"""Offer routes: create, approve, send, list."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.offer import JobOffer
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.offer import JobOfferActionRequest, JobOfferCreate, JobOfferResponse
from app.utils.pagination import paginate

router = APIRouter()


@router.post("", response_model=JobOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: JobOfferCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Create a job offer."""
    offer = JobOffer(**data.model_dump())
    db.add(offer)
    await db.flush()
    await db.refresh(offer)
    return JobOfferResponse.model_validate(offer)


@router.get("", response_model=PaginatedResponse[JobOfferResponse])
async def list_offers(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    status_filter: str | None = Query(default=None, alias="status"),
):
    """List job offers."""
    query = select(JobOffer)
    if status_filter:
        query = query.where(JobOffer.status == status_filter)
    return await paginate(db, query, params, JobOfferResponse)


@router.get("/{offer_id}", response_model=JobOfferResponse)
async def get_offer(
    offer_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single job offer."""
    result = await db.execute(select(JobOffer).where(JobOffer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job offer not found")
    return JobOfferResponse.model_validate(offer)


@router.patch("/{offer_id}/action", response_model=JobOfferResponse)
async def action_offer(
    offer_id: UUID,
    data: JobOfferActionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Approve or send a job offer."""
    from datetime import UTC, datetime

    result = await db.execute(select(JobOffer).where(JobOffer.id == offer_id))
    offer = result.scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job offer not found")

    if data.action == "approve":
        if offer.status != "draft" and offer.status != "awaiting_approval":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve offer with status '{offer.status}'",
            )
        offer.status = "approved"
        offer.approved_by = current_user.id
        offer.approved_at = datetime.now(UTC)
    elif data.action == "send":
        if offer.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer must be approved before sending",
            )
        offer.status = "sent"
        offer.sent_at = datetime.now(UTC)

    await db.flush()
    await db.refresh(offer)
    return JobOfferResponse.model_validate(offer)
