import { Role } from "../enums";

// ─── User ───────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_mfa_enabled: boolean;
  roles: UserRole[];
  employee_id: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  role: Role;
  scope: "global" | "company" | "department";
  scope_id: string | null;
}

// ─── Auth Requests ──────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
  device_id?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  employee_id?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ─── Auth Responses ─────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: User;
}

export interface MfaSetupResponse {
  secret: string;
  qr_code_uri: string;
  backup_codes: string[];
}

export interface MfaChallengeResponse {
  requires_mfa: true;
  mfa_token: string;
}

// ─── Permission ─────────────────────────────────────────────────
export interface Permission {
  id: string;
  module: string;
  action: "create" | "read" | "update" | "delete" | "approve" | "export";
  resource: string;
  scope: "own" | "team" | "department" | "company" | "all";
}
