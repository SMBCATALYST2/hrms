"""Designation routes: CRUD operations."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.designation import Designation
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.designation import DesignationCreate, DesignationResponse, DesignationUpdate
from app.utils.pagination import paginate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[DesignationResponse])
async def list_designations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """List all designations with pagination."""
    query = select(Designation)
    if params.search:
        query = query.where(Designation.name.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, DesignationResponse)


@router.post("", response_model=DesignationResponse, status_code=status.HTTP_201_CREATED)
async def create_designation(
    data: DesignationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a new designation."""
    desig = Designation(**data.model_dump())
    db.add(desig)
    await db.flush()
    await db.refresh(desig)
    return DesignationResponse.model_validate(desig)


@router.get("/{designation_id}", response_model=DesignationResponse)
async def get_designation(
    designation_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single designation by ID."""
    result = await db.execute(select(Designation).where(Designation.id == designation_id))
    desig = result.scalar_one_or_none()
    if not desig:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Designation not found")
    return DesignationResponse.model_validate(desig)


@router.patch("/{designation_id}", response_model=DesignationResponse)
async def update_designation(
    designation_id: UUID,
    data: DesignationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a designation."""
    result = await db.execute(select(Designation).where(Designation.id == designation_id))
    desig = result.scalar_one_or_none()
    if not desig:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Designation not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(desig, field, value)
    await db.flush()
    await db.refresh(desig)
    return DesignationResponse.model_validate(desig)


@router.delete("/{designation_id}", response_model=SuccessResponse)
async def delete_designation(
    designation_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Deactivate a designation."""
    result = await db.execute(select(Designation).where(Designation.id == designation_id))
    desig = result.scalar_one_or_none()
    if not desig:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Designation not found")
    desig.status = "inactive"
    await db.flush()
    return SuccessResponse(message="Designation deactivated successfully")
