"""Authentication service: login, register, refresh token logic."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import Role, User, UserRole


class AuthError(Exception):
    """Authentication-related error."""

    def __init__(self, message: str, status_code: int = 401):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Validate credentials and return the user, raising AuthError on failure."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise AuthError("Invalid email or password")

    if user.locked_until and user.locked_until > datetime.now(UTC):
        raise AuthError("Account is temporarily locked. Try again later.", 423)

    if not verify_password(password, user.password_hash):
        user.login_attempts += 1
        if user.login_attempts >= 5:
            from datetime import timedelta
            user.locked_until = datetime.now(UTC) + timedelta(minutes=30)
        await db.flush()
        raise AuthError("Invalid email or password")

    if not user.is_active:
        raise AuthError("Account is deactivated", 403)

    # Reset login attempts on success
    user.login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.now(UTC)
    await db.flush()

    return user


async def create_tokens(db: AsyncSession, user: User) -> dict:
    """Generate access and refresh tokens for a user."""
    # Fetch roles
    result = await db.execute(
        select(UserRole).where(UserRole.user_id == user.id)
    )
    user_roles = result.scalars().all()
    role_codes = []
    for ur in user_roles:
        if ur.role:
            role_codes.append(ur.role.code)

    access_token = create_access_token(
        user_id=user.id,
        roles=role_codes,
        employee_id=user.employee_id,
    )
    refresh_token = create_refresh_token(user_id=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    role_code: str = "employee",
    employee_id: UUID | None = None,
) -> User:
    """Create a new user account and assign a role."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise AuthError("Email already registered", 409)

    user = User(
        email=email,
        password_hash=hash_password(password),
        employee_id=employee_id,
    )
    db.add(user)
    await db.flush()

    # Assign role
    result = await db.execute(select(Role).where(Role.code == role_code))
    role = result.scalar_one_or_none()
    if role:
        user_role = UserRole(user_id=user.id, role_id=role.id)
        db.add(user_role)
        await db.flush()

    return user


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
    """Validate a refresh token and issue new token pair."""
    from jose import JWTError

    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise AuthError("Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise AuthError("Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthError("Token missing subject")

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise AuthError("User not found or deactivated")

    return await create_tokens(db, user)
