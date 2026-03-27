"""Shared response schemas used across all API modules."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class PaginationMeta(BaseModel):
    """Pagination metadata included in list responses."""

    model_config = ConfigDict(from_attributes=True)

    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated list response wrapper."""

    model_config = ConfigDict(from_attributes=True)

    data: list[T]
    pagination: PaginationMeta
    message: str = "Success"


class SuccessResponse(BaseModel):
    """Generic success response for mutation endpoints."""

    model_config = ConfigDict(from_attributes=True)

    data: Any = None
    message: str = "Success"


class ErrorDetail(BaseModel):
    """Individual field-level error detail."""

    field: str | None = None
    message: str
    code: str | None = None


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error: dict[str, Any] = {
        "code": "UNKNOWN_ERROR",
        "message": "An unexpected error occurred",
        "details": [],
    }
