"""Request/response schemas for authentication endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    """Credentials for email/password login."""

    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    """Payload for creating a new user account (admin-initiated)."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="employee", description="Role code to assign")
    employee_id: uuid.UUID | None = None


class TokenResponse(BaseModel):
    """JWT token pair returned on successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token lifetime in seconds")


class RefreshTokenRequest(BaseModel):
    """Refresh token rotation request."""

    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Request a password reset link via email."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Set new password using a reset token."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    """Change password while authenticated."""

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class UserResponse(BaseModel):
    """Public representation of a user account."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    is_active: bool
    is_email_verified: bool
    mfa_enabled: bool
    last_login: datetime | None = None
    employee_id: uuid.UUID | None = None
    roles: list[str] = []
    created_at: datetime
    updated_at: datetime
