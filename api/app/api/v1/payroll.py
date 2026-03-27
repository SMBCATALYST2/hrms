"""Payroll routes: structures CRUD, components CRUD, assignments, run payroll, payslips."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, RequireRole, get_current_user
from app.models.payroll import (
    SalaryComponent,
    SalarySlip,
    SalaryStructure,
    SalaryStructureAssignment,
    SalaryStructureDetail,
)
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.payroll import (
    PayrollEntryResponse,
    PayrollRunRequest,
    SalaryComponentCreate,
    SalaryComponentResponse,
    SalaryComponentUpdate,
    SalarySlipResponse,
    SalaryStructureAssignmentCreate,
    SalaryStructureAssignmentResponse,
    SalaryStructureCreate,
    SalaryStructureResponse,
    SalaryStructureUpdate,
)
from app.services.payroll_service import run_payroll
from app.utils.pagination import paginate

router = APIRouter()


# --- Salary Components ---

@router.get("/components", response_model=PaginatedResponse[SalaryComponentResponse])
async def list_salary_components(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List salary components."""
    query = select(SalaryComponent)
    if company_id:
        query = query.where(SalaryComponent.company_id == company_id)
    return await paginate(db, query, params, SalaryComponentResponse)


@router.post("/components", response_model=SalaryComponentResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_component(
    data: SalaryComponentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a salary component."""
    comp = SalaryComponent(**data.model_dump())
    db.add(comp)
    await db.flush()
    await db.refresh(comp)
    return SalaryComponentResponse.model_validate(comp)


@router.patch("/components/{component_id}", response_model=SalaryComponentResponse)
async def update_salary_component(
    component_id: UUID,
    data: SalaryComponentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a salary component."""
    result = await db.execute(select(SalaryComponent).where(SalaryComponent.id == component_id))
    comp = result.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salary component not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(comp, field, value)
    await db.flush()
    await db.refresh(comp)
    return SalaryComponentResponse.model_validate(comp)


# --- Salary Structures ---

@router.get("/structures", response_model=PaginatedResponse[SalaryStructureResponse])
async def list_salary_structures(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
):
    """List salary structures."""
    query = select(SalaryStructure)
    if company_id:
        query = query.where(SalaryStructure.company_id == company_id)
    return await paginate(db, query, params, SalaryStructureResponse)


@router.post("/structures", response_model=SalaryStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_salary_structure(
    data: SalaryStructureCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Create a salary structure with details."""
    details_data = data.details
    structure = SalaryStructure(
        company_id=data.company_id,
        name=data.name,
        description=data.description,
        payroll_frequency=data.payroll_frequency,
    )
    db.add(structure)
    await db.flush()

    for detail in details_data:
        ssd = SalaryStructureDetail(
            salary_structure_id=structure.id,
            **detail.model_dump(),
        )
        db.add(ssd)

    await db.flush()
    await db.refresh(structure)
    return SalaryStructureResponse.model_validate(structure)


@router.patch("/structures/{structure_id}", response_model=SalaryStructureResponse)
async def update_salary_structure(
    structure_id: UUID,
    data: SalaryStructureUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Update a salary structure."""
    result = await db.execute(select(SalaryStructure).where(SalaryStructure.id == structure_id))
    structure = result.scalar_one_or_none()
    if not structure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salary structure not found")

    update_data = data.model_dump(exclude_unset=True, exclude={"details"})
    for field, value in update_data.items():
        setattr(structure, field, value)

    if data.details is not None:
        # Delete existing details and recreate
        existing = await db.execute(
            select(SalaryStructureDetail).where(
                SalaryStructureDetail.salary_structure_id == structure_id
            )
        )
        for d in existing.scalars().all():
            await db.delete(d)
        await db.flush()
        for detail in data.details:
            ssd = SalaryStructureDetail(
                salary_structure_id=structure_id,
                **detail.model_dump(),
            )
            db.add(ssd)

    await db.flush()
    await db.refresh(structure)
    return SalaryStructureResponse.model_validate(structure)


# --- Assignments ---

@router.post("/assignments", response_model=SalaryStructureAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    data: SalaryStructureAssignmentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Assign a salary structure to an employee."""
    assignment = SalaryStructureAssignment(**data.model_dump())
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    return SalaryStructureAssignmentResponse.model_validate(assignment)


@router.get("/assignments", response_model=PaginatedResponse[SalaryStructureAssignmentResponse])
async def list_assignments(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    employee_id: UUID | None = Query(default=None),
):
    """List salary structure assignments."""
    query = select(SalaryStructureAssignment)
    if employee_id:
        query = query.where(SalaryStructureAssignment.employee_id == employee_id)
    return await paginate(db, query, params, SalaryStructureAssignmentResponse)


# --- Payroll Run ---

@router.post("/run", response_model=PayrollEntryResponse, status_code=status.HTTP_201_CREATED)
async def run_payroll_route(
    data: PayrollRunRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(RequireRole("super_admin", "hr_admin"))],
):
    """Run payroll for a company and period."""
    entry = await run_payroll(db, data.company_id, data.start_date, data.end_date, data.posting_date)
    return PayrollEntryResponse.model_validate(entry)


# --- Pay Slips ---

@router.get("/payslips", response_model=PaginatedResponse[SalarySlipResponse])
async def list_payslips(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    employee_id: UUID | None = Query(default=None),
):
    """List salary slips."""
    query = select(SalarySlip)
    if employee_id:
        query = query.where(SalarySlip.employee_id == employee_id)
    elif current_user.employee_id:
        query = query.where(SalarySlip.employee_id == current_user.employee_id)
    return await paginate(db, query, params, SalarySlipResponse)


@router.get("/payslips/{slip_id}", response_model=SalarySlipResponse)
async def get_payslip(
    slip_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single salary slip by ID."""
    result = await db.execute(select(SalarySlip).where(SalarySlip.id == slip_id))
    slip = result.scalar_one_or_none()
    if not slip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salary slip not found")
    return SalarySlipResponse.model_validate(slip)
