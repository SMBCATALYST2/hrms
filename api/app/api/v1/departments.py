"""Department routes: CRUD + tree hierarchy."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.department import Department
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentTreeNode,
    DepartmentUpdate,
)
from app.utils.pagination import paginate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[DepartmentResponse])
async def list_departments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List departments with pagination and optional company filter."""
    query = select(Department)
    if company_id:
        query = query.where(Department.company_id == company_id)
    if params.search:
        query = query.where(Department.name.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, DepartmentResponse)


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    data: DepartmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a new department."""
    dept = Department(**data.model_dump())
    db.add(dept)
    await db.flush()
    await db.refresh(dept)
    return DepartmentResponse.model_validate(dept)


@router.get("/tree", response_model=list[DepartmentTreeNode])
async def get_department_tree(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    company_id: UUID = Query(...),
):
    """Get department tree hierarchy for a company."""
    result = await db.execute(
        select(Department)
        .where(Department.company_id == company_id)
        .options(selectinload(Department.sub_departments))
    )
    all_depts = result.scalars().all()

    dept_map = {d.id: d for d in all_depts}
    roots = [d for d in all_depts if d.parent_department_id is None]

    def build_tree(dept: Department) -> DepartmentTreeNode:
        children = [d for d in all_depts if d.parent_department_id == dept.id]
        return DepartmentTreeNode(
            id=dept.id,
            name=dept.name,
            code=dept.code,
            status=dept.status,
            children=[build_tree(c) for c in children],
        )

    return [build_tree(r) for r in roots]


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single department by ID."""
    result = await db.execute(select(Department).where(Department.id == department_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return DepartmentResponse.model_validate(dept)


@router.patch("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: UUID,
    data: DepartmentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a department."""
    result = await db.execute(select(Department).where(Department.id == department_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    await db.flush()
    await db.refresh(dept)
    return DepartmentResponse.model_validate(dept)


@router.delete("/{department_id}", response_model=SuccessResponse)
async def delete_department(
    department_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Deactivate a department."""
    result = await db.execute(select(Department).where(Department.id == department_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    dept.status = "inactive"
    await db.flush()
    return SuccessResponse(message="Department deactivated successfully")
