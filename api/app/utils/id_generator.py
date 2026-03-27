"""Auto-generated human-readable IDs (e.g., HR-EMP-2026-00001)."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee


async def generate_employee_code(db: AsyncSession, prefix: str = "HR-EMP") -> str:
    """Generate the next sequential employee code for the current year.

    Format: {prefix}-{YYYY}-{NNNNN}
    Example: HR-EMP-2026-00001, HR-EMP-2026-00002

    Args:
        db: Async database session.
        prefix: Code prefix (default HR-EMP).

    Returns:
        Next available employee code string.
    """
    year = datetime.now(UTC).year
    year_prefix = f"{prefix}-{year}-"

    # Find the highest existing code for this year
    result = await db.execute(
        select(func.max(Employee.employee_code)).where(
            Employee.employee_code.like(f"{year_prefix}%")
        )
    )
    max_code = result.scalar()

    if max_code:
        # Extract the numeric part and increment
        numeric_part = max_code.replace(year_prefix, "")
        next_num = int(numeric_part) + 1
    else:
        next_num = 1

    return f"{year_prefix}{next_num:05d}"
