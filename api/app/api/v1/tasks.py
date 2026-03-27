"""Task routes: CRUD, assign, status update, my-tasks, team-tasks."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import PaginationParams, get_current_user
from app.models.task import Task, TaskComment
from app.models.user import User
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.task import (
    TaskAssignRequest,
    TaskCommentCreate,
    TaskCommentResponse,
    TaskCreate,
    TaskResponse,
    TaskStatusUpdate,
    TaskUpdate,
)
from app.services.task_service import (
    add_comment,
    assign_task,
    create_task,
    get_task,
    list_my_tasks,
    list_team_tasks,
    update_task,
    update_task_status,
)
from app.utils.pagination import paginate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[TaskResponse])
async def list_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
    company_id: UUID | None = Query(default=None),
    assigned_to_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
):
    """List tasks with optional filters."""
    query = select(Task)
    if company_id:
        query = query.where(Task.company_id == company_id)
    if assigned_to_id:
        query = query.where(Task.assigned_to_id == assigned_to_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    if params.search:
        query = query.where(Task.title.ilike(f"%{params.search}%"))
    return await paginate(db, query, params, TaskResponse)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_route(
    data: TaskCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new task."""
    assigned_by_id = current_user.employee_id
    task = await create_task(db, data, assigned_by_id)
    return TaskResponse.model_validate(task)


@router.get("/my-tasks", response_model=PaginatedResponse[TaskResponse])
async def my_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """Get tasks assigned to the current employee."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    return await list_my_tasks(db, current_user.employee_id, params)


@router.get("/team-tasks", response_model=PaginatedResponse[TaskResponse])
async def team_tasks(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    params: Annotated[PaginationParams, Depends()],
):
    """Get tasks assigned by the current employee (manager view)."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    return await list_team_tasks(db, current_user.employee_id, params)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task_route(
    task_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a single task."""
    task = await get_task(db, task_id)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task_route(
    task_id: UUID,
    data: TaskUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a task."""
    task = await update_task(db, task_id, data)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}/assign", response_model=TaskResponse)
async def assign_task_route(
    task_id: UUID,
    data: TaskAssignRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Assign a task to an employee."""
    task = await assign_task(db, task_id, data.assigned_to_id)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_status_route(
    task_id: UUID,
    data: TaskStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update a task's status."""
    task = await update_task_status(db, task_id, data.status)
    return TaskResponse.model_validate(task)


@router.post("/{task_id}/comments", response_model=TaskCommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment_route(
    task_id: UUID,
    data: TaskCommentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Add a comment to a task."""
    if not current_user.employee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No linked employee")
    comment = await add_comment(db, task_id, current_user.employee_id, data.content)
    return TaskCommentResponse.model_validate(comment)


@router.get("/{task_id}/comments", response_model=list[TaskCommentResponse])
async def list_comments(
    task_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """List all comments on a task."""
    result = await db.execute(
        select(TaskComment).where(TaskComment.task_id == task_id).order_by(TaskComment.created_at)
    )
    comments = result.scalars().all()
    return [TaskCommentResponse.model_validate(c) for c in comments]
