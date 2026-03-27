"""Recruitment routes: job openings CRUD, job applications CRUD + pipeline stage update."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.recruitment import JobApplication, JobOpening
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.recruitment import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
    JobOpeningCreate,
    JobOpeningResponse,
    JobOpeningUpdate,
    StageUpdateRequest,
)
from app.services.recruitment_service import update_application_stage
from app.utils.pagination import paginate

router = APIRouter()


# --- Job Openings ---

@router.get("/openings", response_model=PaginatedResponse[JobOpeningResponse])
async def list_openings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
):
    """List job openings."""
    query = select(JobOpening)
    if company_id:
        query = query.where(JobOpening.company_id == company_id)
    if status_filter:
        query = query.where(JobOpening.status == status_filter)
    if params.search:
        query = query.where(JobOpening.title.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, JobOpeningResponse)


@router.post("/openings", response_model=JobOpeningResponse, status_code=status.HTTP_201_CREATED)
async def create_opening(
    data: JobOpeningCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Create a job opening."""
    opening = JobOpening(**data.model_dump())
    db.add(opening)
    await db.flush()
    await db.refresh(opening)
    return JobOpeningResponse.model_validate(opening)


@router.get("/openings/{opening_id}", response_model=JobOpeningResponse)
async def get_opening(
    opening_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single job opening."""
    result = await db.execute(select(JobOpening).where(JobOpening.id == opening_id))
    opening = result.scalar_one_or_none()
    if not opening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    return JobOpeningResponse.model_validate(opening)


@router.patch("/openings/{opening_id}", response_model=JobOpeningResponse)
async def update_opening(
    opening_id: UUID,
    data: JobOpeningUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Update a job opening."""
    result = await db.execute(select(JobOpening).where(JobOpening.id == opening_id))
    opening = result.scalar_one_or_none()
    if not opening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(opening, field, value)
    await db.flush()
    await db.refresh(opening)
    return JobOpeningResponse.model_validate(opening)


@router.delete("/openings/{opening_id}", response_model=SuccessResponse)
async def delete_opening(
    opening_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Cancel a job opening."""
    result = await db.execute(select(JobOpening).where(JobOpening.id == opening_id))
    opening = result.scalar_one_or_none()
    if not opening:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
    opening.status = "cancelled"
    await db.flush()
    return SuccessResponse(message="Job opening cancelled")


# --- Job Applications ---

@router.get("/applications", response_model=PaginatedResponse[JobApplicationResponse])
async def list_applications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    opening_id: UUID | None = Query(default=None),
    stage: str | None = Query(default=None),
):
    """List job applications."""
    query = select(JobApplication)
    if opening_id:
        query = query.where(JobApplication.job_opening_id == opening_id)
    if stage:
        query = query.where(JobApplication.stage == stage)
    if params.search:
        query = query.where(JobApplication.applicant_name.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, JobApplicationResponse)


@router.post("/applications", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: JobApplicationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Submit a job application."""
    app = JobApplication(**data.model_dump())
    db.add(app)
    await db.flush()
    await db.refresh(app)
    return JobApplicationResponse.model_validate(app)


@router.get("/applications/{application_id}", response_model=JobApplicationResponse)
async def get_application(
    application_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single job application."""
    result = await db.execute(select(JobApplication).where(JobApplication.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job application not found")
    return JobApplicationResponse.model_validate(app)


@router.patch("/applications/{application_id}", response_model=JobApplicationResponse)
async def update_application(
    application_id: UUID,
    data: JobApplicationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Update a job application."""
    result = await db.execute(select(JobApplication).where(JobApplication.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job application not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(app, field, value)
    await db.flush()
    await db.refresh(app)
    return JobApplicationResponse.model_validate(app)


@router.patch("/applications/{application_id}/stage", response_model=JobApplicationResponse)
async def update_stage(
    application_id: UUID,
    data: StageUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin", "hr_manager"))],
):
    """Update a job application's pipeline stage."""
    app = await update_application_stage(db, application_id, data.stage, data.notes)
    return JobApplicationResponse.model_validate(app)
