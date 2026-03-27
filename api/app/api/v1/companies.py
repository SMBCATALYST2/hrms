"""Company routes: CRUD operations."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.company import Company
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyUpdate
from app.utils.pagination import paginate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CompanyResponse])
async def list_companies(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """List all companies with pagination."""
    query = select(Company)
    if params.search:
        query = query.where(Company.name.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, CompanyResponse)


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin"))],
):
    """Create a new company."""
    company = Company(**data.model_dump())
    db.add(company)
    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single company by ID."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return CompanyResponse.model_validate(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    data: CompanyUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin"))],
):
    """Update an existing company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    await db.flush()
    await db.refresh(company)
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", response_model=SuccessResponse)
async def delete_company(
    company_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin"))],
):
    """Deactivate a company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    company.status = "inactive"
    await db.flush()
    return SuccessResponse(message="Company deactivated successfully")
