import { api } from "./api";
import { API_ROUTES } from "../constants/api";
import { storage } from "../utils/storage";

// Types matching web/src/types/auth.ts
export type UserRole =
  | "super_admin"
  | "hr_admin"
  | "hr_manager"
  | "department_head"
  | "manager"
  | "employee";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  employee_id?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      data
    );
    const { access_token, refresh_token, user } = response.data;

    // Store tokens
    await storage.setAccessToken(access_token);
    await storage.setRefreshToken(refresh_token);
    await storage.setUser(JSON.stringify(user));

    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>(API_ROUTES.AUTH.ME);
    await storage.setUser(JSON.stringify(response.data));
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await storage.getRefreshToken();
      await api.post(API_ROUTES.AUTH.LOGOUT, {
        refresh_token: refreshToken,
      });
    } catch {
      // Logout even if API call fails
    } finally {
      await storage.clearTokens();
    }
  },

  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = await storage.getRefreshToken();
    const response = await api.post<TokenResponse>(API_ROUTES.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    await storage.setAccessToken(response.data.access_token);
    await storage.setRefreshToken(response.data.refresh_token);

    return response.data;
  },
};
