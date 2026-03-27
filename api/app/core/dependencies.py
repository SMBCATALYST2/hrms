"""Shared FastAPI dependencies: DB session, current user, role enforcement."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate the current user from the Bearer token."""
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


class RequireRole:
    """FastAPI dependency that enforces one or more roles on the current user.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: User = Depends(RequireRole("super_admin", "hr_admin"))
        ):
            ...
    """

    def __init__(self, *allowed_roles: str):
        self.allowed_roles = set(allowed_roles)

    async def __call__(
        self,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> User:
        result = await db.execute(
            select(UserRole).where(UserRole.user_id == current_user.id)
        )
        user_roles = result.scalars().all()

        user_role_codes: set[str] = set()
        for ur in user_roles:
            if ur.role:
                user_role_codes.add(ur.role.code)

        # If user has no explicitly loaded role relation, fall back to eager-loaded roles
        if not user_role_codes:
            from sqlalchemy.orm import selectinload

            result2 = await db.execute(
                select(UserRole)
                .options(selectinload(UserRole.role))
                .where(UserRole.user_id == current_user.id)
            )
            user_roles_loaded = result2.scalars().all()
            user_role_codes = {ur.role.code for ur in user_roles_loaded if ur.role}

        if not self.allowed_roles.intersection(user_role_codes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions. Required roles: " + ", ".join(self.allowed_roles),
            )

        return current_user


class PaginationParams:
    """Shared pagination parameters dependency."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Items per page"),
        sort_by: str = Query("created_at", description="Field to sort by"),
        sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort direction"),
        search: str | None = Query(None, description="Search query"),
    ):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size
        self.sort_by = sort_by
        self.sort_order = sort_order
        self.search = search
