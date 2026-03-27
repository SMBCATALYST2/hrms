"""Pagination helper for building paginated query responses."""

import math
from typing import Any, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import PaginationParams
from app.schemas.common import PaginatedResponse, PaginationMeta

T = TypeVar("T")


async def paginate(
    db: AsyncSession,
    query: Select[Any],
    params: PaginationParams,
    response_model: type[T],
) -> PaginatedResponse[T]:
    """Execute a query with pagination and return a PaginatedResponse.

    Args:
        db: Async database session.
        query: Base SQLAlchemy select query (before limit/offset).
        params: Pagination parameters from the request.
        response_model: Pydantic model to validate each result row.

    Returns:
        PaginatedResponse containing data, pagination metadata, and message.
    """
    # Count total items
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total_items = total_result.scalar() or 0
    total_pages = math.ceil(total_items / params.page_size) if total_items > 0 else 0

    # Apply sorting
    from sqlalchemy import asc, desc

    sort_col = None
    # Try to resolve sort column from the query's selected entity
    for entity in query.column_descriptions:
        model = entity.get("entity")
        if model and hasattr(model, params.sort_by):
            sort_col = getattr(model, params.sort_by)
            break

    if sort_col is not None:
        order_fn = desc if params.sort_order == "desc" else asc
        query = query.order_by(order_fn(sort_col))

    # Apply pagination
    query = query.offset(params.offset).limit(params.page_size)

    result = await db.execute(query)
    rows = result.scalars().all()

    # Convert ORM objects to Pydantic models
    data = [response_model.model_validate(row) for row in rows]

    pagination = PaginationMeta(
        page=params.page,
        page_size=params.page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=params.page < total_pages,
        has_prev=params.page > 1,
    )

    return PaginatedResponse(data=data, pagination=pagination)
