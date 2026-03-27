"""Holiday routes: lists (calendars) CRUD, holidays CRUD."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.holiday import Holiday, HolidayCalendar
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.holiday import (
    HolidayCalendarCreate,
    HolidayCalendarResponse,
    HolidayCalendarUpdate,
    HolidayCreate,
    HolidayResponse,
    HolidayUpdate,
)
from app.utils.pagination import paginate

router = APIRouter()

_PLACEHOLDER_TENANT = UUID("00000000-0000-0000-0000-000000000000")


# --- Holiday Calendars ---

@router.get("/lists", response_model=PaginatedResponse[HolidayCalendarResponse])
async def list_holiday_calendars(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List holiday calendars."""
    query = select(HolidayCalendar)
    if company_id:
        query = query.where(HolidayCalendar.company_id == company_id)
    return await paginate(db, query, params, HolidayCalendarResponse)


@router.post("/lists", response_model=HolidayCalendarResponse, status_code=status.HTTP_201_CREATED)
async def create_holiday_calendar(
    data: HolidayCalendarCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a new holiday calendar."""
    cal = HolidayCalendar(tenant_id=_PLACEHOLDER_TENANT, **data.model_dump())
    db.add(cal)
    await db.flush()
    await db.refresh(cal)
    return HolidayCalendarResponse.model_validate(cal)


@router.patch("/lists/{calendar_id}", response_model=HolidayCalendarResponse)
async def update_holiday_calendar(
    calendar_id: UUID,
    data: HolidayCalendarUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a holiday calendar."""
    result = await db.execute(select(HolidayCalendar).where(HolidayCalendar.id == calendar_id))
    cal = result.scalar_one_or_none()
    if not cal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday calendar not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cal, field, value)
    await db.flush()
    await db.refresh(cal)
    return HolidayCalendarResponse.model_validate(cal)


@router.delete("/lists/{calendar_id}", response_model=SuccessResponse)
async def delete_holiday_calendar(
    calendar_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Delete a holiday calendar."""
    result = await db.execute(select(HolidayCalendar).where(HolidayCalendar.id == calendar_id))
    cal = result.scalar_one_or_none()
    if not cal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday calendar not found")
    await db.delete(cal)
    await db.flush()
    return SuccessResponse(message="Holiday calendar deleted")


# --- Holidays ---

@router.get("", response_model=list[HolidayResponse])
async def list_holidays(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    calendar_id: UUID = Query(...),
):
    """List holidays in a calendar."""
    result = await db.execute(
        select(Holiday).where(Holiday.holiday_calendar_id == calendar_id).order_by(Holiday.date)
    )
    holidays = result.scalars().all()
    return [HolidayResponse.model_validate(h) for h in holidays]


@router.post("", response_model=HolidayResponse, status_code=status.HTTP_201_CREATED)
async def create_holiday(
    data: HolidayCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a holiday."""
    holiday = Holiday(**data.model_dump())
    db.add(holiday)
    await db.flush()
    await db.refresh(holiday)
    return HolidayResponse.model_validate(holiday)


@router.patch("/{holiday_id}", response_model=HolidayResponse)
async def update_holiday(
    holiday_id: UUID,
    data: HolidayUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a holiday."""
    result = await db.execute(select(Holiday).where(Holiday.id == holiday_id))
    holiday = result.scalar_one_or_none()
    if not holiday:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(holiday, field, value)
    await db.flush()
    await db.refresh(holiday)
    return HolidayResponse.model_validate(holiday)


@router.delete("/{holiday_id}", response_model=SuccessResponse)
async def delete_holiday(
    holiday_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Delete a holiday."""
    result = await db.execute(select(Holiday).where(Holiday.id == holiday_id))
    holiday = result.scalar_one_or_none()
    if not holiday:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday not found")
    await db.delete(holiday)
    await db.flush()
    return SuccessResponse(message="Holiday deleted")
