"""Task service: task CRUD, assignment, AI priority scoring placeholder."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import PaginationParams
from app.models.task import Task, TaskComment
from app.schemas.common import PaginatedResponse
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.utils.pagination import paginate


async def create_task(
    db: AsyncSession, data: TaskCreate, assigned_by_id: UUID | None = None,
) -> Task:
    """Create a new task."""
    task = Task(
        assigned_by_id=assigned_by_id,
        **data.model_dump(),
    )
    # Placeholder AI priority scoring
    task.ai_priority_score = _compute_ai_priority(data)
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


def _compute_ai_priority(data: TaskCreate) -> int:
    """Placeholder for AI-driven priority scoring (0-100)."""
    score = 50
    if data.priority == "urgent":
        score = 90
    elif data.priority == "high":
        score = 75
    elif data.priority == "low":
        score = 25
    if data.due_date:
        from datetime import date
        days_until = (data.due_date - date.today()).days
        if days_until <= 1:
            score = min(score + 20, 100)
        elif days_until <= 3:
            score = min(score + 10, 100)
    return score


async def get_task(db: AsyncSession, task_id: UUID) -> Task:
    """Fetch a single task by ID."""
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


async def update_task(db: AsyncSession, task_id: UUID, data: TaskUpdate) -> Task:
    """Update a task."""
    task = await get_task(db, task_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.flush()
    await db.refresh(task)
    return task


async def assign_task(db: AsyncSession, task_id: UUID, assigned_to_id: UUID) -> Task:
    """Assign a task to an employee."""
    task = await get_task(db, task_id)
    task.assigned_to_id = assigned_to_id
    await db.flush()
    await db.refresh(task)
    return task


async def update_task_status(db: AsyncSession, task_id: UUID, new_status: str) -> Task:
    """Update task status."""
    task = await get_task(db, task_id)
    task.status = new_status
    if new_status == "completed":
        from datetime import datetime, UTC
        task.completed_at = datetime.now(UTC)
    await db.flush()
    await db.refresh(task)
    return task


async def list_my_tasks(
    db: AsyncSession, employee_id: UUID, params: PaginationParams,
) -> PaginatedResponse[TaskResponse]:
    """List tasks assigned to a specific employee."""
    query = select(Task).where(Task.assigned_to_id == employee_id)
    if params.search:
        query = query.where(Task.title.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, TaskResponse)


async def list_team_tasks(
    db: AsyncSession, manager_employee_id: UUID, params: PaginationParams,
) -> PaginatedResponse[TaskResponse]:
    """List tasks assigned by a manager."""
    query = select(Task).where(Task.assigned_by_id == manager_employee_id)
    if params.search:
        query = query.where(Task.title.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, TaskResponse)


async def add_comment(
    db: AsyncSession, task_id: UUID, employee_id: UUID, content: str,
) -> TaskComment:
    """Add a comment to a task."""
    # Verify task exists
    await get_task(db, task_id)
    comment = TaskComment(task_id=task_id, employee_id=employee_id, content=content)
    db.add(comment)
    await db.flush()
    await db.refresh(comment)
    return comment
