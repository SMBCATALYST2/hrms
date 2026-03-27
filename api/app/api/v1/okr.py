"""OKR routes: cycles, objectives, key results, check-ins, alignment."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.okr import KeyResult, Objective, OKRCycle
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.okr import (
    KeyResultCreate,
    KeyResultResponse,
    KeyResultUpdate,
    OKRCheckInCreate,
    OKRCheckInResponse,
    OKRCycleCreate,
    OKRCycleResponse,
    OKRCycleUpdate,
    ObjectiveCreate,
    ObjectiveResponse,
    ObjectiveUpdate,
)
from app.services.okr_service import create_check_in
from app.utils.pagination import paginate

router = APIRouter()


# --- Cycles ---

@router.get("/cycles", response_model=PaginatedResponse[OKRCycleResponse])
async def list_cycles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List OKR cycles."""
    query = select(OKRCycle)
    if company_id:
        query = query.where(OKRCycle.company_id == company_id)
    return await paginate(db, query, params, OKRCycleResponse)


@router.post("/cycles", response_model=OKRCycleResponse, status_code=status.HTTP_201_CREATED)
async def create_cycle(
    data: OKRCycleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create an OKR cycle."""
    cycle = OKRCycle(**data.model_dump())
    db.add(cycle)
    await db.flush()
    await db.refresh(cycle)
    return OKRCycleResponse.model_validate(cycle)


@router.patch("/cycles/{cycle_id}", response_model=OKRCycleResponse)
async def update_cycle(
    cycle_id: UUID,
    data: OKRCycleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update an OKR cycle."""
    result = await db.execute(select(OKRCycle).where(OKRCycle.id == cycle_id))
    cycle = result.scalar_one_or_none()
    if not cycle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OKR cycle not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cycle, field, value)
    await db.flush()
    await db.refresh(cycle)
    return OKRCycleResponse.model_validate(cycle)


# --- Objectives ---

@router.get("/objectives", response_model=PaginatedResponse[ObjectiveResponse])
async def list_objectives(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    cycle_id: UUID | None = Query(default=None),
    employee_id: UUID | None = Query(default=None),
):
    """List objectives."""
    query = select(Objective)
    if cycle_id:
        query = query.where(Objective.cycle_id == cycle_id)
    if employee_id:
        query = query.where(Objective.owner_employee_id == employee_id)
    elif current_user.employee_id:
        query = query.where(Objective.owner_employee_id == current_user.employee_id)
    return await paginate(db, query, params, ObjectiveResponse)


@router.post("/objectives", response_model=ObjectiveResponse, status_code=status.HTTP_201_CREATED)
async def create_objective(
    data: ObjectiveCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create an objective."""
    obj = Objective(**data.model_dump())
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return ObjectiveResponse.model_validate(obj)


@router.patch("/objectives/{objective_id}", response_model=ObjectiveResponse)
async def update_objective(
    objective_id: UUID,
    data: ObjectiveUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an objective."""
    result = await db.execute(select(Objective).where(Objective.id == objective_id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    await db.flush()
    await db.refresh(obj)
    return ObjectiveResponse.model_validate(obj)


@router.get("/objectives/{objective_id}/alignment", response_model=list[ObjectiveResponse])
async def get_alignment(
    objective_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get the alignment chain (parent objectives up to root)."""
    chain = []
    current_id = objective_id
    seen = set()
    while current_id and current_id not in seen:
        seen.add(current_id)
        result = await db.execute(select(Objective).where(Objective.id == current_id))
        obj = result.scalar_one_or_none()
        if not obj:
            break
        chain.append(ObjectiveResponse.model_validate(obj))
        current_id = obj.parent_objective_id
    return chain


# --- Key Results ---

@router.get("/key-results", response_model=PaginatedResponse[KeyResultResponse])
async def list_key_results(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    objective_id: UUID | None = Query(default=None),
):
    """List key results."""
    query = select(KeyResult)
    if objective_id:
        query = query.where(KeyResult.objective_id == objective_id)
    return await paginate(db, query, params, KeyResultResponse)


@router.post("/key-results", response_model=KeyResultResponse, status_code=status.HTTP_201_CREATED)
async def create_key_result(
    data: KeyResultCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a key result."""
    kr = KeyResult(**data.model_dump())
    db.add(kr)
    await db.flush()
    await db.refresh(kr)
    return KeyResultResponse.model_validate(kr)


@router.patch("/key-results/{kr_id}", response_model=KeyResultResponse)
async def update_key_result(
    kr_id: UUID,
    data: KeyResultUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a key result."""
    result = await db.execute(select(KeyResult).where(KeyResult.id == kr_id))
    kr = result.scalar_one_or_none()
    if not kr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Key result not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(kr, field, value)
    await db.flush()
    await db.refresh(kr)
    return KeyResultResponse.model_validate(kr)


# --- Check-Ins ---

@router.post("/check-ins", response_model=OKRCheckInResponse, status_code=status.HTTP_201_CREATED)
async def create_check_in_route(
    data: OKRCheckInCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Record a progress check-in on a key result."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    check_in = await create_check_in(
        db, data.key_result_id, current_user.employee_id,
        data.new_value, data.comment, data.confidence_level,
    )
    return OKRCheckInResponse.model_validate(check_in)
