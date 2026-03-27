"""Payroll service: salary slip generation and payroll processing."""

from datetime import date
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.payroll import (
    PayrollEntry,
    SalaryComponent,
    SalarySlip,
    SalarySlipItem,
    SalaryStructure,
    SalaryStructureAssignment,
    SalaryStructureDetail,
)


async def _get_active_assignment(
    db: AsyncSession, employee_id: UUID, as_of: date,
) -> SalaryStructureAssignment | None:
    """Find the active salary structure assignment for an employee on a given date."""
    result = await db.execute(
        select(SalaryStructureAssignment).where(
            and_(
                SalaryStructureAssignment.employee_id == employee_id,
                SalaryStructureAssignment.is_active == True,
                SalaryStructureAssignment.from_date <= as_of,
            )
        ).order_by(SalaryStructureAssignment.from_date.desc())
    )
    return result.scalars().first()


async def generate_salary_slip(
    db: AsyncSession,
    employee_id: UUID,
    start_date: date,
    end_date: date,
    posting_date: date,
    payroll_entry_id: UUID | None = None,
) -> SalarySlip:
    """Generate a salary slip for an employee for a given period."""
    assignment = await _get_active_assignment(db, employee_id, start_date)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No active salary structure assignment for employee {employee_id}",
        )

    # Fetch structure details
    result = await db.execute(
        select(SalaryStructureDetail).where(
            SalaryStructureDetail.salary_structure_id == assignment.salary_structure_id
        ).order_by(SalaryStructureDetail.sort_order)
    )
    details = result.scalars().all()

    # Calculate working days (simple: all calendar days in the period)
    total_days = (end_date - start_date).days + 1
    # TODO: subtract holidays and leaves for accurate payment_days
    payment_days = total_days

    base = assignment.base_amount
    gross = Decimal("0")
    total_deductions = Decimal("0")
    slip_items: list[dict] = []

    # Process each component
    for detail in details:
        comp_result = await db.execute(
            select(SalaryComponent).where(SalaryComponent.id == detail.salary_component_id)
        )
        component = comp_result.scalar_one_or_none()
        if not component:
            continue

        # Calculate amount
        amount = Decimal("0")
        if detail.amount:
            amount = detail.amount
        elif detail.percentage and base:
            amount = (detail.percentage / 100) * base

        # Prorate based on payment days
        if component.depends_on_payment_days and total_days > 0:
            amount = (amount * payment_days) / total_days

        amount = amount.quantize(Decimal("0.01"))

        if component.type == "earning":
            gross += amount
        else:
            total_deductions += amount

        slip_items.append({
            "salary_component_id": component.id,
            "type": component.type,
            "amount": amount,
            "sort_order": detail.sort_order,
        })

    net_pay = gross - total_deductions

    slip = SalarySlip(
        employee_id=employee_id,
        payroll_entry_id=payroll_entry_id,
        salary_structure_id=assignment.salary_structure_id,
        start_date=start_date,
        end_date=end_date,
        posting_date=posting_date,
        total_working_days=total_days,
        payment_days=payment_days,
        gross_pay=gross,
        total_deductions=total_deductions,
        net_pay=net_pay,
    )
    db.add(slip)
    await db.flush()

    # Create slip items
    for item_data in slip_items:
        item = SalarySlipItem(salary_slip_id=slip.id, **item_data)
        db.add(item)

    await db.flush()
    await db.refresh(slip)
    return slip


async def run_payroll(
    db: AsyncSession,
    company_id: UUID,
    start_date: date,
    end_date: date,
    posting_date: date,
) -> PayrollEntry:
    """Run payroll for all eligible employees in a company."""
    # Create payroll entry
    entry = PayrollEntry(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date,
        posting_date=posting_date,
        status="draft",
    )
    db.add(entry)
    await db.flush()

    # Find all active employees in the company
    result = await db.execute(
        select(Employee).where(
            and_(
                Employee.company_id == company_id,
                Employee.status == "active",
            )
        )
    )
    employees = result.scalars().all()

    total_gross = Decimal("0")
    total_deductions = Decimal("0")
    total_net = Decimal("0")
    count = 0

    for emp in employees:
        try:
            slip = await generate_salary_slip(
                db, emp.id, start_date, end_date, posting_date, entry.id,
            )
            total_gross += slip.gross_pay
            total_deductions += slip.total_deductions
            total_net += slip.net_pay
            count += 1
        except HTTPException:
            # Skip employees without salary structure assignments
            continue

    entry.total_gross = total_gross
    entry.total_deductions = total_deductions
    entry.total_net = total_net
    entry.employee_count = count
    entry.status = "submitted"

    await db.flush()
    await db.refresh(entry)
    return entry
