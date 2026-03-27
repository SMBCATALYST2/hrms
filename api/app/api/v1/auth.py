"""Authentication routes: login, register, refresh, logout, me."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    AuthError,
    authenticate_user,
    create_tokens,
    refresh_access_token,
    register_user,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Authenticate with email/password and receive JWT tokens."""
    try:
        user = await authenticate_user(db, data.email, data.password)
        tokens = await create_tokens(db, user)
        return tokens
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Register a new user account."""
    try:
        user = await register_user(
            db, data.email, data.password, data.role, data.employee_id,
        )
        return UserResponse.model_validate(user)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Refresh an access token using a valid refresh token."""
    try:
        tokens = await refresh_access_token(db, data.refresh_token)
        return tokens
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/logout")
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    """Logout the current user (client-side token invalidation)."""
    # In a stateless JWT setup, logout is handled client-side.
    # For server-side invalidation, a token blocklist (Redis) would be used.
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    """Get the currently authenticated user's profile."""
    roles = []
    if current_user.user_roles:
        for ur in current_user.user_roles:
            if ur.role:
                roles.append(ur.role.code)
    resp = UserResponse.model_validate(current_user)
    resp.roles = roles
    return resp
